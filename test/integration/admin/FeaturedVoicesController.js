'use strict'

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

var login = require(path.join(__dirname, 'login.js')),
  expect = require('chai').expect

CONFIG.database.logQueries = false

var urlBase = 'http://localhost:3000'

describe('FeaturedVoicesController', function () {

  describe('#updatePositions', function () {

    it('Re-order featured voices', function (done) {
      login('cersei', function (err, agent, csrf) {
        if (err) { return done(err) }

        FeaturedVoice.all(function (err, featured) {
          if (err) { return done(err) }

          var hashedIds = featured.sort(function (a, b) {
            return a.position - b.position
          }).map(function (val) {
            return hashids.encode(val.entityId)
          })

          agent
            .post(urlBase + '/admin/featured/voices/updatePositions')
            .accept('application/json')
            .send({
              _csrf: csrf,
              voiceIds: hashedIds,
            })
            .end(function (err, res) {
              if (err) { return done(err) }

              expect(res.status).to.equal(200)
              expect(res.body.status).to.equal('updated positions')

              return done()
            })
        })
      })
    })

  })

  describe('#create', function () {

    it('Create featured voice', function (done) {
      login('cersei', function (err, agent, csrf) {
        if (err) { return done(err) }

        agent
          .post(urlBase + '/admin/featured/voices/new')
          .accept('application/json')
          .send({
            _csrf: csrf,
            voiceId: hashids.encode(13), // Winterfell
          })
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)

            FeaturedVoice.find({
              voice_id: 13, // Winterfell
            }, function (err, voices) {
              if (err) { return done(err) }

              expect(voices.length).to.equal(1)
              expect(voices[0].voiceId).to.equal(13)

              return done()
            })
          })
      })
    })

  })

})
