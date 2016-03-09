'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.log = function () {}

var expect = require('chai').expect

describe('K.Message', function () {

  describe('Relations', function () {

    describe('thread', function () {

      it('Should return a proper MessageThread object', function (doneTest) {
        K.Message.query()
          .where('id', 1)
          .include('thread')
          .then(function (messages) {
            var message = messages[0]

            expect(message.thread).to.be.an('object')
            expect(message.thread.constructor.className).to.equal('MessageThread')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('senderEntity', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.Message.query()
          .where('id', 1)
          .include('senderEntity')
          .then(function (messages) {
            var message = messages[0]

            expect(message.senderEntity).to.be.an('object')
            expect(message.senderEntity.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('senderPerson', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.Message.query()
          .where('id', 1)
          .include('senderPerson')
          .then(function (messages) {
            var message = messages[0]

            expect(message.senderPerson).to.be.an('object')
            expect(message.senderPerson.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('receiverEntity', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.Message.query()
          .where('id', 1)
          .include('receiverEntity')
          .then(function (messages) {
            var message = messages[0]

            expect(message.receiverEntity).to.be.an('object')
            expect(message.receiverEntity.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
