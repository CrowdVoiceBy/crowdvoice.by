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

describe('SessionsController', function () {

  describe('#login', function () {

    it('Should redirect to home when trying whilst logged-in', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest() }

        agent
          .get(urlBase + '/login')
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            // -> Home -> Feed
            expect(res.redirects.length).to.equal(2)

            return doneTest()
          })
      })
    })

  })

  describe('#logout', function () {

    it('Should redirect to home when trying whilst logged-out', function (doneTest) {
      request
        .get(urlBase + '/logout')
        .end(function (err, res) {
          if (err) { return doneTest(err) }

          // -> Home
          expect(res.redirects.length).to.equal(1)

          return doneTest()
        })
    })

  })

})
