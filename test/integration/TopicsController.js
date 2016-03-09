'use strict'

var application = require('neonode-core')
require(path.join(__dirname, '../../lib/routes.js'))

global.FeedInjector = require(path.join(__dirname, '../../lib/FeedInjector.js'))
require(path.join(__dirname, '../../presenters/PostsPresenter'))

application._serverStart()

// COMMENT IF YOU WANT LOGGER OUTPUT
logger.info = function () {}

var login = require(path.join(__dirname, 'login.js')),
  expect = require('chai').expect,
  request = require('superagent')

CONFIG.database.logQueries = false

var urlBase = 'http://localhost:3000'

describe('TopicsController', function () {

  describe('#newestVoices', function () {

    it('Should return 3 voices', function (done) {
      request
        .get(urlBase + '/topic/health/newestVoices')
        .end(function (err, res) {
          if (err) { return done(err) }

          expect(res.status).to.equal(200)
          expect(res.body.voices.length).to.equal(3)

          return done()
        })
    })

  })

  describe('#getTopicBySlug', function () {

    it('Should return 200', function (doneTest) {
      request
        .get(urlBase + '/topic/health')
        .end(function (err, res) {
          if (err) { return doneTest(err) }

          expect(res.status).to.equal(200)

          return doneTest()
        })
    })

  })

})
