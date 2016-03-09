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

describe('HomeController', function () {

  describe('#index', function () {

    it('Should return 200', function (doneTest) {
      request
        .get(urlBase)
        .end(function (err, res) {
          if (err) { return doneTest(err) }

          expect(res.status).to.equal(200)

          return doneTest()
        })
    })

    it('Should return the right amount of featured entities', function (doneTest) {
      request
        .get(urlBase)
        .accept('application/json')
        .end(function (err, res) {
          if (err) { return doneTest(err) }

          expect(res.status).to.equal(200)
          expect(res.body.status).to.equal('ok')
          expect(res.body.featuredEntities.length).to.equal(6)

          return doneTest()
        })
    })

  })

})
