'use strict'

var application = require('neonode-core')
require(path.join(__dirname, '../../lib/routes.js'))

global.FeedInjector = require(path.join(__dirname, '../../lib/FeedInjector.js'))
require(path.join(__dirname, '../../presenters/PostsPresenter'))

application._serverStart()

// COMMENT IF YOU WANT LOGGER OUTPUT
logger.info = function () {}

var login = require(path.join(__dirname, 'login.js')),
  expect = require('chai').expect

CONFIG.database.logQueries = false

var urlBase = 'http://localhost:3000'

describe('DiscoverController', function () {

  describe('#recommendedIndex', function () {

    // The following is commented out because there is no real way to check
    // whether the output is the same, at least not without changing the
    // endpoint so it returns through JSON or something.
    /*
    it('Output for non-anon is same as for anon', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        var result1,
          result2

        async.series([
          function (nextSeries) {
            agent
              .get(urlBase + '/discover/recommended')
              .accept('application/json')
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)
                result1 = res.body

                return nextSeries()
              })
          },

          function (nextSeries) {
            agent
              .get(urlBase + '/switchPerson')
              .end(function (err, res) {
                if (err) { return seriesNext(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          },

          function (nextSeries) {
            agent
              .get(urlBase + '/discover/recommended')
              .accept('application/json')
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)
                result2 = res.body
                console.log(res)

                return nextSeries()
              })
          },
        ], function (err) {
          if (err) { return doneTest(err) }

          expect(result1).to.eql(result2)

          return doneTest()
        })
      })
    })
    */

    it('recommendedIndex doesn\'t crash when anonymous', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .get(urlBase + '/switchPerson')
          .end(function (err, res) {
            if (err) { return seriesNext(err) }

            expect(res.status).to.equal(200)

            return doneTest()
          })
      })
    })

  })

})
