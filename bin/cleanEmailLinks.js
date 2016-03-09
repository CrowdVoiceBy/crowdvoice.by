'use strict'

var path = require('path'),
  knexfile = require(path.join(__dirname, '../knexfile.js')),
  db = require('knex')(knexfile[process.env.NODE_ENV || 'development']),
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

      db('EmailLinks')
        .whereRaw("created_at < '" + moment().subtract(7, 'days').format() + "'")
        .then(function (records) {
          var ids = records.map(function (row) { return row.id })

          return db('EmailLinks')
            .whereIn('id', ids)
            .del()
        })
        .catch(function (err) {
          logger.error(err)
          logger.error(err.stack)
        })

    },

    start: true,
    timeZone: 'UTC',
  })

})
