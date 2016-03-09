'use strict'

// SETUP NEONODE

global.Admin = {}

var application = require('neonode-core')
require(path.join(__dirname, '../../lib/routes.js'))

// Load moment
global.moment = require('moment')

global.FeedInjector = require(path.join(__dirname, '../../lib/FeedInjector.js'))
require(path.join(__dirname, '../../presenters/PostsPresenter'))

application._serverStart()

// COMMENT IF YOU WANT LOGGER OUTPUT
logger.info = function () {}

var request = require('superagent'),
  expect = require('chai').expect

CONFIG.database.logQueries = false

var urlBase = 'http://localhost:3000'

var login = function (username, callback) {
  var csrf,
    agent = request.agent()

  async.series([
    function (next) {
      agent
        .get(urlBase + '/csrf')
        .end(function (err, res) {
          if (err) { return callback(err) }

          csrf = res.text

          return next()
        })
    },

    function (next) {
      agent
        .post(urlBase + '/session')
        .send({
          _csrf: csrf,
          username: username,
          password: '12345678'
        })
        .end(function (err, res) {
          if (err) { return callback(err) }

          return next()
        })
    },
  ], function (err) {
    if (err) { return callback(err) }

    return callback(null, agent, csrf)
  })
}

// ACTUAL TESTS

describe('FeaturedEntitiesController', function () {

  describe('#updatePositions', function () {

    it('Re-order featured people', function (done) {
      // LOGIN
      login('cersei', function (err, agent, csrf) {
        if (err) { return done(err) }

        FeaturedPerson.all(function (err, featured) {
          if (err) { t.fail(err) }

          var hashedIds = featured.sort(function (a, b) {
            return a.position - b.position
          }).map(function (val) {
            return hashids.encode(val.entityId)
          })

          // REORDER
          agent
            .post(urlBase + '/admin/featured/people/updatePositions')
            .accept('application/json')
            .send({
              _csrf: csrf,
              entityIds: hashedIds,
            })
            .end(function (err, res) {
              if (err) { return done(err) }

              expect(res.status).to.equal(200)
              expect(res.body.status).to.equal('updated positions')

              done()
            })
        })
      })
    })

    it('Re-order featured organizations', function (done) {
      // LOGIN
      login('cersei', function (err, agent, csrf) {
        if (err) { return done(err) }

        FeaturedOrganization.all(function (err, featured) {
          if (err) { t.fail(err) }

          var hashedIds = featured.sort(function (a, b) {
            return a.position - b.position
          }).map(function (val) {
            return hashids.encode(val.entityId)
          })

          // REORDER
          agent
            .post(urlBase + '/admin/featured/organizations/updatePositions')
            .accept('application/json')
            .send({
              _csrf: csrf,
              entityIds: hashedIds,
            })
            .end(function (err, res) {
              if (err) { return done(err) }

              expect(res.status).to.equal(200)
              expect(res.body.status).to.equal('updated positions')

              done()
            })
        })
      })
    })

  })

  describe('#create', function () {

    it('Add featured organization', function (done) {
      // LOGIN
      login('cersei', function (err, agent, csrf) {
        if (err) { return done(err) }

        // CREATE
        agent
          .post(urlBase + '/admin/featured/organizations/new')
          .accept('application/json')
          .send({
            _csrf: csrf,
            entityId: 'AVolB9X1b3Ym', // 24, House Baratheon
          })
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)

            FeaturedOrganization.find({ entity_id: 24 }, function (err, result) {
              if (err) { return done(err) }

              expect(result.length).to.equal(1)

              done()
            })

          })
      })
    })

  })

})
