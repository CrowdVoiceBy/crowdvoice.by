#!/usr/bin/env node
var path = require('path');
var application = require(path.join(process.cwd(), 'lib', 'neonode-core'));

require(path.join(process.cwd(), 'lib', 'krypton', 'load-models.js'));

global.useGM = false;

// Load aws-sdk and S3
var AWS = require('aws-sdk');
global.amazonS3 = new AWS.S3(CONFIG.s3);

// Load image processors
global.sharp = require('sharp');

var Promise = require('bluebird')

var cpuLength = 1;

var casual = require('casual');

CONFIG.database.logQueries = true;

var voiceId = parseInt(process.argv[2], 10),
  postsCount = parseInt(process.argv[3], 10)

K.Voice.query()
  .where('id', '=', voiceId)
  .then(function (voice) {
    return new Promise(function (res, rej) {
      async.times(postsCount, function (n, doneTimes) {
        var post = new K.Post({
          title: 'Generator Post #' + n,
          description: 'Just a random description for this post, you know...',
          ownerId: voice[0].ownerId,
          voiceId: voice[0].id,
          approved: casual.random_element([true, false]),
          imageBaseUrl: '',
          imageMeta: {},
          sourceService: 'link',
          sourceType: 'link',
          sourceUrl: 'http://google.com/'  + '?' + casual.random,
          publishedAt: new Date(),
          sourceDomain: null,
          faviconPath: null,
        })

        post.save()
          .then(function (model) {
            return doneTimes(null, model)
          })
          .catch(doneTimes)
      }, function (err) {
        if (err) { return rej(err) }

        return res()
      })
    })
  })
  .then(function () {
    return K.Post.query()
      .where('voice_id', '=', voiceId)
      .then(function (posts) {
        return Promise.each(posts, function (post) {
          var saved = new K.SavedPost({
            entityId: 3,
            postId: post.id,
          })

          return saved.save()
        })
      })
  })
  .then(function () {
    return K.Post.query()
      .where('voice_id', '=', voiceId)
      .then(function (posts) {
        return Promise.each(posts, function (post) {
          var vote = new K.Vote({
            value: casual.random_element([1, -1]),
            postId: post.id,
            entityId: 3,
            ip: '127.0.0.1',
          })

          return vote.save()
        })
      })
  })
  .then(function () {
    console.log('FINISHED SUCCESSFULLY!')
    process.exit(0)
  })
  .catch(function (err) {
    if (err) {
      logger.error(err)
      console.log(err.stack);
      return process.exit(1)
    }
  })
