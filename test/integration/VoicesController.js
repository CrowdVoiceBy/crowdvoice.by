'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

// COMMENT IF YOU WANT LOGGER OUTPUT
logger.info = function () {}

var login = require(path.join(__dirname, 'login.js')),
  expect = require('chai').expect,
  request = require('superagent')

CONFIG.database.logQueries = false

var urlBase = 'http://localhost:3000'

describe('VoicesController', function () {

  describe('#follow', function () {

    it('Should follow voice', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/jon-snow/white-walkers/follow')
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
                  item_type: 'voice',
                  item_id: 12,
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
                  item_type: 'voice',
                  item_id: 12,
                  action: 'followed your voice',
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

  describe('#inviteToContribute', function () {

    it('Invite to contribute', function (done) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return done(err) }

        agent
          .post(urlBase + '/cersei-lannister/walk-of-atonement/inviteToContribute')
          .accept('application/json')
          .send({
            _csrf: csrf,
            personId: hashids.encode(9), // Jon
            message: 'I know you want to',
          })
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)
            expect(res.body.status).to.equal('invited')

            return done()
          })
      })
    })

    it('"Refresh" invitation_voice message instead of duplicating', function (done) {
      login('cersei-lannister', function (err, agent, csrf) {
        // send our invitations
        async.series([
          function (next) {
            agent
              .post(urlBase + '/cersei-lannister/walk-of-atonement/inviteToContribute')
              .accept('application/json')
              .send({
                _csrf: csrf,
                personId: hashids.encode(17), // Robert
                message: 'I think this is an offer you cannot turn down...',
              })
              .end(function (err, res) {
                if (err) { return done(err) }

                expect(res.status).to.equal(200)
                expect(res.body.status).to.equal('invited')

                return next()
              })
          },

          function (next) {
            agent
              .post(urlBase + '/cersei-lannister/walk-of-atonement/inviteToContribute')
              .accept('application/json')
              .send({
                _csrf: csrf,
                personId: hashids.encode(17), // Robert
                message: 'Just re-sending it, you know...',
              })
              .end(function (err, res) {
                if (err) { return done(err) }

                expect(res.status).to.equal(200)
                expect(res.body.status).to.equal('already invited')

                return next()
              })
          },

          function (next) {
            agent
              .post(urlBase + '/cersei-lannister/walk-of-atonement/inviteToContribute')
              .accept('application/json')
              .send({
                _csrf: csrf,
                personId: hashids.encode(17), // Robert
                message: 'The real final invitation',
              })
              .end(function (err, res) {
                if (err) { return done(err) }

                expect(res.status).to.equal(200)
                expect(res.body.status).to.equal('already invited')

                return next()
              })
          },
        ], function (err) { // async.series
          if (err) { return done(err) }

          // check that records check out

          async.series([
            // invitation requests
            function (next) {
              InvitationRequest.find({
                invited_entity_id: 17, // Robert
                invitator_entity_id: 3, // Cersei
              }, function (err, invitations) {
                if (err) { return next(err) }

                expect(invitations.length).to.equal(1)

                return next()
              })
            },

            // messages
            function (next) {
              Message.find({
                type: 'invitation_voice',
                sender_person_id: 3, // Cersei
                sender_entity_id: 3,
                receiver_entity_id: 17, // Robert
                voice_id: 6, // Walk of Atonement
              }, function (err, messages) {
                if (err) { return next(err) }

                expect(messages.length).to.equal(1)
                expect(messages[0].message).to.equal('The real final invitation')

                return next()
              })
            },
          ], done)
        })
      })
    })

  })

  describe('#requestToContribute', function () {

    it('Request to contribute', function (done) {
      login('cersei-lannister', function (err, agent, csrf) {
        agent
          .post(urlBase + '/cersei-lannister/walk-of-atonement/requestToContribute')
          .accept('application/json')
          .send({
            _csrf: csrf,
            message: 'I know you want to me to join',
          })
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)

            return done()
          })
      })
    })

  })

  describe('#create', function () {

    it('Should prevent from insta-publishing', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/voice')
          .accept('application/json')
          .send({
            _csrf: csrf,
            image: 'undefined',
            title: 'Deez nuts',
            slug: 'deez-nuts',
            description: 'This is a new and completely unique description.',
            topics: 'd6wb1XVgRvzm',
            type: 'TYPE_PUBLIC',
            status: 'STATUS_PUBLISHED',
            twitterSearch: '#csgo',
            locationName: 'Casterly Rock',
            latitude: '4.815',
            longitude: '162.342',
            anonymously: 'false',
            ownerId: hashids.encode(3), // Cersei
          })
          .end(function (err, res) {
            expect(res.status).to.equal(403)

            return doneTest()
          })
      })
    })

  })

  describe('#update', function () {

    it('Should prevent from publishing without fulfilling requirements', function (doneTest) {
      login('tyrion-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .put(urlBase + '/tyrion-lannister/valyrian-roads')
          .accept('application/json')
          .send({
            _csrf: csrf,
            image: 'undefined',
            title: 'Valyrian roads',
            slug: 'valyrian-roads',
            description: 'Valyrian roads are broad stone highways built when the Valyrian Freehold dominated Essos.',
            topics: '8ZnLyQLgNaME,K8adgKWgZPlo,5q7WBDqgOlG8',
            type: 'TYPE_CLOSED',
            status: 'STATUS_PUBLISHED',
            twitterSearch: '',
            locationName: 'Valyria',
            latitude: '4.815',
            longitude: '162.342',
            anonymously: 'false',
            ownerId: hashids.encode(1), // Tyrion
          })
          .end(function (err, res) {
            expect(res.status).to.equal(403)

            return doneTest()
          })
      })
    })

    it('Should prevent from drafting once published or unlisted', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .put(urlBase + '/house-lannister/casterly-rock')
          .accept('application/json')
          .send({
            _csrf: csrf,
            image: 'undefined',
            title: 'Casterly Rock',
            slug: 'casterly-rock',
            description: 'This is a new and completely unique description.',
            topics: 'd6wb1XVgRvzm',
            type: 'TYPE_PUBLIC',
            status: 'STATUS_DRAFT',
            twitterSearch: '#csgo',
            locationName: 'Casterly Rock',
            latitude: '4.815',
            longitude: '162.342',
            anonymously: 'false',
            ownerId: 'dWK6yYeyk8P4'
          })
          .end(function (err, res) {
            expect(res.status).to.equal(403)

            return doneTest()
          })
      })
    })

    it('Update voice owned by organization you own', function (done) {
      login('cersei-lannister', function (err, agent, csrf) {
        agent
          .put(urlBase + '/house-lannister/casterly-rock')
          .accept('application/json')
          .send({
            _csrf: csrf,
            image: 'undefined',
            title: 'Casterly Rock',
            slug: 'casterly-rock',
            description: 'This is a new and completely unique description.',
            topics: 'd6wb1XVgRvzm',
            type: 'TYPE_PUBLIC',
            // status: 'STATUS_PUBLISHED', // Removed in order to work around issues
            twitterSearch: '#csgo',
            locationName: 'Casterly Rock',
            latitude: '4.815',
            longitude: '162.342',
            anonymously: 'false',
            ownerId: 'dWK6yYeyk8P4'
          })
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)

            Voice.findById(15, function (err, voice) {
              if (err) { done(err) }

              expect(voice[0].description).to.equal('This is a new and completely unique description.')

              return done()
            })
          })
      })
    })

    it('Should not update ownerId of Anonymous Voice even if provided', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        async.series([
          function (nextSeries) {
            agent
              .post(urlBase + '/voice')
              .accept('application/json')
              .send({
                _csrf: csrf,
                image: 'undefined',
                title: 'Casterly nock',
                slug: 'casterly-nock',
                description: 'This is a new and completely unique description.',
                topics: 'd6wb1XVgRvzm',
                type: 'TYPE_PUBLIC',
                status: 'STATUS_DRAFT',
                locationName: 'Casterly Rock',
                latitude: '4.815',
                longitude: '162.342',
                anonymously: 'true',
                ownerId: 'K8adgKWgZPlo'
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          },

          function (nextSeries) {
            agent
              .put(urlBase + '/anonymous/casterly-nock')
              .accept('application/json')
              .send({
                _csrf: csrf,
                image: 'undefined',
                title: 'Casterly nock',
                slug: 'casterly-nock',
                description: 'This is a new and completely unique description.',
                topics: 'd6wb1XVgRvzm',
                type: 'TYPE_PUBLIC',
                status: 'STATUS_DRAFT',
                locationName: 'Casterly Rock',
                latitude: '4.815',
                longitude: '162.342',
                ownerId: 'K8adgKWgZPlo'
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                Voice.findById(15, function (err, voice) {
                  if (err) { return nextSeries(err) }

                  expect(voice[0].description).to.equal('This is a new and completely unique description.')

                  return nextSeries()
                })
              })
          },
        ], function (err) {
          if (err) { return doneTest(err) }

          Voice.find({
            owner_id: 4,
          }, function (err, voice) {
            if (err) { return doneTest(err) }

            expect(voice.length).to.equal(1)

            return doneTest()
          })
        })

      })
    })

    it('Should update optional fields into empty strings when empty strings are provided', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .put(urlBase + '/anonymous/casterly-nock')
          .field('_csrf', csrf)
          .field('image', 'undefined')
          .field('title', 'Casterly nock')
          .field('slug', 'casterly-nock')
          .field('description', 'This is a new and completely unique description.')
          .field('topics', 'd6wb1XVgRvzm')
          .field('type', 'TYPE_PUBLIC')
          .field('status', 'STATUS_DRAFT')
          .field('locationName', 'Casterly Rock')
          .field('latitude', '4.815')
          .field('longitude', '162.342')
          .field('ownerId', 'K8adgKWgZPlo')
          .field('twitterSearch', '')
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            Voice.find({
              owner_id: 4,
            }, function (err, voice) {
              if (err) { doneTest(err) }

              expect(voice[0].twitterSearch).to.equal('')

              return doneTest()
            })
          })
      })
    })

  })

  describe('#show', function () {

    it('Should let you see unlisted voice', function (doneTest) {
      request
        .get(urlBase + '/cersei-lannister/meereen-siege')
        .end(function (err, res) {
          if (err) { return doneTest(err) }

          expect(res.status).to.equal(200)

          return doneTest()
        })
    })

  })

  describe('#isVoiceSlugAvailable', function () {

    it('Should not return 500', function (doneTest) {
      login('jamie-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/jamie-lannister/roberts-rebelion/isVoiceSlugAvailable')
          .send({
            _csrf: csrf,
            value: 'roberts-rebellion',
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)
            expect(res.body.status).to.equal('available')

            return doneTest()
          })
      })
    })

  })

})
