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

describe('SearchController', function () {

  describe('#index', function () {

    it('Should return results even if one value is NULL', function (doneTest) {
      request
        .get(urlBase + '/search/joff')
        .accept('application/json')
        .end(function (err, res) {
          if (err) { return doneTest(err) }

          expect(res.status).to.equal(200)
          expect(res.body.totals).to.equal(1)
          expect(res.body.preview.people.length).to.equal(1)

          return doneTest()
        })
    })

  })

})
