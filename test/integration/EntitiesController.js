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

describe('EntitiesController', function () {

  describe('#feed', function () {

    it('Should open with no errors', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .get(urlBase + '/cersei-lannister/feed')
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            return doneTest()
          })
      })
    })

    it('Should return JSON', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .get(urlBase + '/cersei-lannister/feed')
          .accept('application/json')
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)
            expect(res.body.feedItems).to.be.an('array')
            expect(res.body.feedItems.length).to.equal(2)
            expect(res.body.totalCount).to.equal(2)

            return doneTest()
          })
      })
    })

  })

  describe('#home', function () {

    it('Should open with no errors', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .get(urlBase + '/cersei-lannister/home')
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            return doneTest()
          })
      })
    })

  })

  describe('#edit', function () {

    it('Should open edit page', function (done) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return done(err) }

        agent
          .get(urlBase + '/cersei-lannister/edit')
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)

            return done()
          })
      })
    })

    it('Should open edit page of organization you own', function (done) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return done(err) }

        agent
          .get(urlBase + '/house-lannister/edit')
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)

            return done()
          })
      })
    })

  })

  describe('#follow', function () {

    it('Should follow with no errors', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/jon-snow/follow')
          .accept('application/json')
          .send({
            _csrf: csrf,
            followerId : hashids.encode(3) // Cersei
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)
            expect(res.body.status).to.equal('followed')

            // FeedInjector tests
            async.series([
              // Feed record not created when it answers to front
              function (nextSeries) {
                setTimeout(nextSeries, 2000)
              },

              // feed
              function (nextSeries) {
                FeedAction.find({
                  item_type: 'entity',
                  item_id: 9,
                  action: 'followed',
                  who: 3,
                }, function (err, result) {
                  if (err) { return nextSeries(err) }

                  expect(result.length).to.equal(1)

                  Notification.find({ action_id: result[0].id }, function (err, result) {
                    if (err) { return nextSeries(err) }

                    expect(result.length).to.equal(3)

                    result.forEach(function (val) {
                      expect(val.read).to.equal(true)
                      expect(val.forFeed).to.equal(true)
                    })

                    return nextSeries()
                  })
                })
              },

              // notification
              function (nextSeries) {
                FeedAction.find({
                  item_type: 'entity',
                  item_id: 9,
                  action: 'followed you',
                  who: 3,
                }, function (err, result) {
                  if (err) { return nextSeries(err) }

                  expect(result.length).to.equal(1)

                  Notification.find({
                    action_id: result[0].id,
                    follower_id: 9,
                  }, function (err, result) {
                    if (err) { return nextSeries(err) }

                    expect(result.length).to.equal(1)

                    expect(result[0].read).to.equal(false)
                    expect(result[0].forFeed).to.equal(false)

                    return nextSeries()
                  })
                })
              },
            ], doneTest)
          })
      })
    })

  })

})
