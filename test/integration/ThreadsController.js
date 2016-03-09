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

describe('ThreadsController', function () {

  describe('#create', function () {

    it('Create new thread', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        agent
          .post(urlBase + '/cersei-lannister/messages')
          .accept('application/json')
          .send({
            _csrf: csrf,
            type: 'message',
            senderEntityId: hashids.encode(3), // Cersei
            receiverEntityId: hashids.encode(17), // Robert
            message: '2685390919',
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            FeedAction.find({
              item_type: 'message',
              item_id: 8,
              action: 'sent you a message',
              who: 3,
            }, function (err, result) {
              if (err) { return nextSeries(err) }

              expect(result.length).to.equal(1)

              Notification.find({
                action_id: result[0].id,
                follower_id: 17,
              }, function (err, result) {
                if (err) { return nextSeries(err) }

                expect(result.length).to.equal(1)

                expect(result[0].read).to.equal(false)
                expect(result[0].forFeed).to.equal(false)

                return doneTest()
              })
            })
          })
      })
    })

    it('"Refresh" invitation_organization message instead of duplicating', function (done) {
      login('cersei-lannister', function (err, agent, csrf) {
        // send our invitations
        async.series([
          function (next) {
            agent
              .post(urlBase + '/cersei-lannister/messages')
              .accept('application/json')
              .send({
                _csrf: csrf,
                type: 'invitation_organization',
                senderEntityId: hashids.encode(3), // Cersei
                receiverEntityId: hashids.encode(17), // Robert
                organizationId: hashids.encode(22), // House Lannister
                message: '2650622019',
              })
              .end(function (err, res) {
                if (err) { return done(err) }

                expect(res.status).to.equal(200)

                return next()
              })
          },

          function (next) {
            agent
              .post(urlBase + '/cersei-lannister/messages')
              .accept('application/json')
              .send({
                _csrf: csrf,
                type: 'invitation_organization',
                senderEntityId: hashids.encode(3), // Cersei
                receiverEntityId: hashids.encode(17), // Robert
                organizationId: hashids.encode(22), // House Lannister
                message: '1237491502',
              })
              .end(function (err, res) {
                if (err) { return done(err) }

                expect(res.status).to.equal(200)

                return next()
              })
          },

          function (next) {
            agent
              .post(urlBase + '/cersei-lannister/messages')
              .accept('application/json')
              .send({
                _csrf: csrf,
                type: 'invitation_organization',
                senderEntityId: hashids.encode(3), // Cersei
                receiverEntityId: hashids.encode(17), // Robert
                organizationId: hashids.encode(22), // House Lannister
                message: '0844856118',
              })
              .end(function (err, res) {
                if (err) { return done(err) }

                expect(res.status).to.equal(200)

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
                type: 'invitation_organization',
                sender_person_id: 3, // Cersei
                sender_entity_id: 3,
                receiver_entity_id: 17, // Robert
                organization_id: 22, // House Lannister
              }, function (err, messages) {
                if (err) { return next(err) }

                expect(messages.length).to.equal(1)
                expect(messages[0].message).to.equal('0844856118')

                return next()
              })
            },

            // notification
            function (nextSeries) {
              FeedAction.find({
                item_type: 'entity',
                item_id: 22,
                action: 'has invited you to become a member',
                who: 3,
              }, function (err, result) {
                if (err) { return nextSeries(err) }

                expect(result.length).to.equal(4)

                Notification.find({
                  action_id: result[0].id,
                  follower_id: 17,
                }, function (err, result) {
                  if (err) { return nextSeries(err) }

                  expect(result.length).to.equal(1)

                  expect(result[0].read).to.equal(false)
                  expect(result[0].forFeed).to.equal(false)

                  return nextSeries()
                })
              })
            },
          ], done)
        })
      })
    })

    it('Should allow person to create thread with receiver being an organization', function (doneTest) {
      login('eddard-stark', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/eddard-stark/messages')
          .accept('application/json')
          .send({
            _csrf: csrf,
            type: 'message',
            senderEntityId: hashids.encode(13), // Eddard
            receiverEntityId: hashids.encode(22), // House Lannister
            message: '8846555126',
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            return doneTest()
          })
      })
    })

    it('Should not allow an Anonymous entity to be involved in threads', function (doneTest) {
      login('eddard-stark', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/eddard-stark/messages')
          .accept('application/json')
          .send({
            _csrf: csrf,
            type: 'message',
            senderEntityId: hashids.encode(13), // Eddard
            receiverEntityId: hashids.encode(4), // Cersei's Anonymous
            message: '1659308890',
          })
          .end(function (err, res) {
            // ACL NotFoundError
            expect(res.status).to.equal(404)

            return doneTest()
          })
      })
    })

    it('Should not create a new thread to send invitation', function (doneTest) {
      async.series([
        // Arya to House Targaryen
        function (nextSeries) {
          login('arya-stark', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/arya-stark/messages')
              .accept('application/json')
              .send({
                _csrf: csrf,
                type: 'message',
                senderEntityId: hashids.encode(11), // Arya
                receiverEntityId: hashids.encode(23), // House Targaryen
                message: '148164312'
              })
              .end(nextSeries)
          })
        },

        // Daenerys as House Targaryen to Arya (invite)
        function (nextSeries) {
          login('daenerys-targaryen', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/daenerys-targaryen/messages')
              .accept('application/json')
              .send({
                _csrf: csrf,
                type: 'invitation_organization',
                senderEntityId: hashids.encode(23), // House Targaryen
                receiverEntityId: hashids.encode(11), // Arya
                organizationId: hashids.encode(23), // House Targaryen
                message: '369169861',
              })
              .end(nextSeries)
          })
        },
      ], function (err) {
        if (err) { return doneTest(err) }

        db('MessageThreads')
          .where('sender_entity_id', 'in', [23, 11])
          .andWhere('receiver_entity_id', 'in', [23, 11])
          .asCallback(function(err, rows) {
            if (err) { return doneTest(err) }

            expect(rows.length).to.equal(1)

            return doneTest()
          })
      })
    })

  })

  describe('#destroy', function () {

    it('Delete invitations of hidden messages and mark as invitation_rejected', function (done) {
      login('cersei-lannister', function (err, agent, csrf) {
        agent
          .del(urlBase + '/cersei-lannister/messages/' + hashids.encode(2))
          .accept('application/json')
          .send({
            _csrf: csrf,
          })
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)
            expect(res.body.status).to.equal('ok')

            async.series([
              function (nextSeries) {
                InvitationRequest.find({
                  invitator_entity_id: 3, // Cersei
                  invited_entity_id: 11, // Arya
                }, function (err, result) {
                  if (err) { return nextSeries(err) }

                  expect(result.length).to.equal(0)

                  return nextSeries()
                })
              },

              function (nextSeries) {
                Message.find({
                  message: '9903255846'
                }, function (err, message) {
                  if (err) { return nextSeries(err) }

                  expect(message[0].type).to.equal('invitation_rejected_organization')

                  return nextSeries()
                })
              },
            ], done)
          })
      })
    })

  })

})
