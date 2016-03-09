'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

// COMMENT IF YOU WANT LOGGER OUTPUT
logger.info = function () {}

var login = require(path.join(__dirname, 'login.js')),
  expect = require('chai').expect

CONFIG.database.logQueries = false

var urlBase = 'http://localhost:3000'

describe('MessagesController', function () {

  describe('#create', function () {

    it('Should not crash when sending message to organization as person', function (doneTest) {
      async.series([
        function (nextSeries) {
          login('cersei-lannister', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/cersei-lannister/messages')
              .accept('application/json')
              .send({
                _csrf: csrf,
                type: 'message',
                senderEntityId: hashids.encode(22), // House Lannister
                receiverEntityId: hashids.encode(5), // Jamie
                message: 'This is from House Lannister to Jamie Lannister, should all work out fine.'
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        function (nextSeries) {
          login('jamie-lannister', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/jamie-lannister/messages/' + hashids.encode(4)) // NOTE: thread ID changes
              .accept('application/json')
              .send({
                _csrf: csrf,
                message: 'This is to House Lannister from Jamie, it should not crash and should register as a message.'
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                Message.findById(9, function (err, result) {
                  if (err) { return nextSeries(err) }

                  expect(result.length).to.equal(1)
                  expect(result[0].message).to.equal('This is to House Lannister from Jamie, it should not crash and should register as a message.')

                  return nextSeries()
                })
              })
          })
        },
      ], doneTest)
    })

    it('Should create message in pre-existing conversation', function (done) {
      login('tyrion-lannister', function (err, agent, csrf) {
        if (err) { return done(err) }

        agent
          .post(urlBase + '/tyrion-lannister/messages/' + hashids.encode(1)) // NOTE: thread ID changes
          .accept('application/json')
          .send({
            _csrf: csrf,
            message: 'So anyway, weird conversation huh?',
          })
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)

            return done()
          })
      })
    })

    it('Creating message in empty, pre-existing thread should not crash NotificationMailer', function (doneTest) {
      async.series([
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
                receiverEntityId: hashids.encode(3), // Cersei
                message: 'Just a test, you know the drill'
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        function (nextSeries) {
          db('Messages')
            .where('thread_id', '=', 3)
            .del()
            .asCallback(nextSeries)
        },

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
                receiverEntityId: hashids.encode(3), // Cersei
                message: 'Just a test, you know the drill'
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },
      ], doneTest)
    })

    it('MessageThread.createMessage should mark the thread as not hidden', function (doneTest) {
      async.series([
        // robert to jamie
        function (nextSeries) {
          login('robert-baratheon', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/robert-baratheon/messages')
              .accept('application/json')
              .send({
                _csrf: csrf,
                type: 'message',
                senderEntityId: hashids.encode(17), // Robert
                receiverEntityId: hashids.encode(5), // Jamie
                message: 'This\'ll be deleted in the near future...'
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        // jamie answer
        function (nextSeries) {
          login('jamie-lannister', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/jamie-lannister/messages')
              .accept('application/json')
              .send({
                _csrf: csrf,
                type: 'message',
                senderEntityId: hashids.encode(5), // Jamie
                receiverEntityId: hashids.encode(17), // Robert
                message: 'This\'ll also be deleted in the near future...'
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        // jamie delete
        function (nextSeries) {
          login('jamie-lannister', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .del(urlBase + '/jamie-lannister/messages/' + hashids.encode(5)) // NOTE: thread ID changes
              .accept('application/json')
              .send({
                _csrf: csrf,
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        // robert to jamie
        function (nextSeries) {
          login('robert-baratheon', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/robert-baratheon/messages/' + hashids.encode(5)) // NOTE: thread ID changes
              .accept('application/json')
              .send({
                _csrf: csrf,
                message: 'It got deleted.  This is an entirely new conversation for you.'
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },
      ], function (err) {
        if (err) { return doneTest(err) }

        MessageThread.findById(5, function (err, thread) { // NOTE: thread ID changes
          if (err) { return doneTest(err) }

          expect(thread[0].hiddenForSender).to.equal(false)
          expect(thread[0].hiddenForReceiver).to.equal(false)

          return doneTest()
        })
      })
    })

  })

  describe('#answerInvite', function () {

    it('"Accept > Leave > Accept > Error" shouldn\'t happen', function (done) {
      async.series([
        function (nextSeries) {
          login('cersei-lannister', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/cersei-lannister/messages')
              .accept('application/json')
              .send({
                _csrf: csrf,
                type: 'invitation_organization',
                senderEntityId: hashids.encode(3), // Cersei
                receiverEntityId: hashids.encode(17), // Robert
                organizationId: hashids.encode(22), // House Lannister
                message: 'I think this is an offer you cannot turn down...',
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        function (nextSeries) {
          login('robert-baratheon', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/robert-baratheon/messages/' + hashids.encode(6) + '/' + hashids.encode(16) + '/answerInvite') // NOTE: IDs changes
              .accept('application/json')
              .send({
                _csrf: csrf,
                action: 'accept',
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        function (nextSeries) {
          login('robert-baratheon', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/robert-baratheon/leaveOrganization')
              .accept('application/json')
              .send({
                _csrf: csrf,
                orgId: hashids.encode(22), // House Lannister
                entityId: hashids.encode(17), // Robert
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        function (nextSeries) {
          login('cersei-lannister', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/cersei-lannister/messages')
              .accept('application/json')
              .send({
                _csrf: csrf,
                type: 'invitation_organization',
                senderEntityId: hashids.encode(3), // Cersei
                receiverEntityId: hashids.encode(17), // Robert
                organizationId: hashids.encode(22), // House Lannister
                message: 'I think this is an offer you cannot turn down...',
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        function (nextSeries) {
          login('robert-baratheon', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/robert-baratheon/messages/' + hashids.encode(6) + '/' + hashids.encode(17) + '/answerInvite') // NOTE: IDs changes
              .accept('application/json')
              .send({
                _csrf: csrf,
                action: 'accept',
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

      ], done)
    })

  })

  describe('#getMessages', function () {

    it('Should return messages', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .get(urlBase + '/cersei-lannister/messages/' + hashids.encode(1) + '/messages')
          .accept('application/json')
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)
            expect(res.body.messages).to.be.an('array')
            expect(res.body.totalCount).to.be.a('number')

            return doneTest()
          })
      })
    })

  })

})
