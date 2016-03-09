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

describe('SearchFromController', function () {

  describe('#youtube', function () {

    it('Should not crash on anonymous voices when search term has a space', function (doneTest) {
      var agent = request.agent(),
        csrf

      async.series([
        function (nextSeries) {
          agent
            .get(urlBase + '/csrf')
            .end(function (err, res) {
              if (err) { return nextSeries(err) }

              csrf = res.text

              return nextSeries()
            })
        },
      ], function (err) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/anonymous_' + hashids.encode(2) + '/second-trial-by-combat/youtube')
          .accept('application/json')
          .send({
            _csrf: csrf,
            query: 'pokemon rocks',
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            return doneTest()
          })
      })
    })

    it('Should return the correct result format', function (doneTest) {
      var agent = request.agent(),
        csrf

      async.series([
        function (nextSeries) {
          agent
            .get(urlBase + '/csrf')
            .end(function (err, res) {
              if (err) { return nextSeries(err) }

              csrf = res.text

              return nextSeries()
            })
        },
      ], function (err) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/anonymous_' + hashids.encode(2) + '/second-trial-by-combat/youtube')
          .accept('application/json')
          .send({
            _csrf: csrf,
            query: 'pokemon',
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            expect(res.body.nextPageToken).to.not.be.null
            expect(res.body.pageInfo).to.not.be.null
            expect(res.body.videos.length).to.be.above(0)

            return doneTest()
          })
      })
    })

    it('Should load the next page if provided the nextPageToken', function (doneTest) {
      var agent = request.agent(),
        csrf,
        nextPageToken

      async.series([
        function (nextSeries) {
          agent
            .get(urlBase + '/csrf')
            .end(function (err, res) {
              if (err) { return nextSeries(err) }

              csrf = res.text

              return nextSeries()
            })
        },

        function (nextSeries) {
          agent
            .post(urlBase + '/anonymous_' + hashids.encode(2) + '/second-trial-by-combat/youtube')
            .accept('application/json')
            .send({
              _csrf: csrf,
              query: 'pokemon',
            })
            .end(function (err, res) {
              if (err) { return nextSeries(err) }

              nextPageToken = res.body.nextPageToken

              return nextSeries()
            })
        },
      ], function (err) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/anonymous_' + hashids.encode(2) + '/second-trial-by-combat/youtube')
          .accept('application/json')
          .send({
            _csrf: csrf,
            query: 'pokemon',
            nextPageToken: nextPageToken,
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            expect(res.body.nextPageToken).to.not.be.null
            expect(res.body.nextPageToken).to.not.equal(nextPageToken)
            expect(res.body.pageInfo).to.not.be.null
            expect(res.body.videos.length).to.be.above(0)

            return doneTest()
          })
      })
    })

  })

})
