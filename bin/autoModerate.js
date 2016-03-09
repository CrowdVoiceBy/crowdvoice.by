'use strict'

var path = require('path'),
  knexfile = require(path.join(__dirname, '../knexfile.js')),
  db = require('knex')(knexfile[process.env.NODE_ENV || 'development']),
  wilsonScore = require('decay').wilsonScore(1.0),
  // redditHot = decay.redditHot(),
  async = require('async'),
  Promise = require('bluebird'),
  moment = require('moment'),
  d = require('domain').create()

/**
 * NEONODE
 */

var application = require(path.join(process.cwd(), 'lib', 'neonode-core'));
require(path.join(__dirname, '../lib/routes.js'))

// Load moment
global.moment = require('moment')

global.FeedInjector = require(path.join(__dirname, '../lib/FeedInjector.js'))
require(path.join(__dirname, '../presenters/PostsPresenter'))

/**
 * NEONODE END
 */

// NEEDS FIX, LOGGER IS NOT ACTUALLY DEFINED!!
d.on('error', function (err) {
  logger.error('Post auto-moderate script error')
  logger.error(err)
  logger.error(err.stack)
})

var cronTimeStr = '0 0 * * * *'

if (process.env.NODE_ENV === 'development') {
  cronTimeStr = '* * * * * *'
}

d.run(function () {

  var CronJob = require('cron').CronJob
  var job = new CronJob({
    cronTime: cronTimeStr,

    onTick: function () {

      db.select('id').from('Voices')
        .where('status', '=', 'STATUS_PUBLISHED')
        .andWhere('type', '=', 'TYPE_PUBLIC')
        .map(function (voice) {
          return voice.id
        })
        .then(function (voiceIds) { // GET POSTS FOR EACH VOICE
          return Promise.all(voiceIds.map(function (voiceId) {
            return db.select('id', 'created_at').from('Posts')
              .where('voice_id', '=', voiceId)
              .andWhere('approved', '=', false)
              // Older than one day
              .andWhereRaw("created_at < '" + moment().subtract(1, 'days').format() + "'")
          }))
        })
        .then(function (postsPerVoice) { // GET RANKS FOR EACH VOICE'S POSTS
          return new Promise(function (resolve, reject) {
            async.mapLimit(postsPerVoice, 3, function (posts, donePosts) {
              async.mapLimit(posts, 3, function (post, donePost) {
                db('Votes')
                  .where('post_id', '=', post.id)
                  .then(function (votes) {
                    var ups = votes.filter(function (vote) { return (vote.value === 1) }),
                      downs = votes.filter(function (vote) { return (vote.value === -1) })

                    return donePost(null, {
                      postId: post.id,
                      score: wilsonScore(ups.length, downs.length),
                      // score: redditHot(ups.length, downs.length, post.created_at),
                    })
                  })
                  .catch(donePost)
              }, donePosts)
            }, function (err, result) {
              if (err) { return reject(err) }

              return resolve(result)
            })
          })
        })
        .then(function (ranks) { // SORT RANKS
          // WILSON SCORE
          ranks.forEach(function (posts) {
            posts.sort(function (a, b) {
              return b.score - a.score // ASC
            })
          })

          // REDDIT HOT
          // Reddit Hot sort will need more work, as it can provide minus numbers,
          // which a simple sort does not sort properly.

          return Promise.resolve(ranks)
        })
        .then(function (ranks) { // FIND THOSE THAT WILL BE APPROVED
          var approved = []

          // WILSON SCORE
          ranks.forEach(function (posts) {
            approved = approved.concat(posts.filter(function (post) {
              return (post.score > 0.70)
            }).map(function (post) {
              return post.postId
            }))
          })

          // REDDIT HOT
          // Reddit Hot will need more work, as its numbers are more complex.

          return Promise.resolve(approved)
        })
        .then(function (approvedPostIds) { // APPROVE POSTS AND DELETE VOTES
          return db('Posts')
            .whereIn('id', approvedPostIds)
            .update({
              approved: true
            })
            .then(function (updatedRows) {
              return db('Votes')
                .whereIn('post_id', approvedPostIds)
                .del()
                .then(function () { // Just so the script can have useful output
                  return updatedRows
                })
            })
        })
        .then(function () {})
        .catch(function (err) {
          logger.error(err)
          logger.error(err.stack)
        })

    },

    start: true,
    timeZone: 'UTC',
  })

})
