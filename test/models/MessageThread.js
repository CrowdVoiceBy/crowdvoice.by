'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.log = function () {}

var expect = require('chai').expect

var constructorLoop = function (array, className) {
  array.forEach(function (a) {
    expect(a.constructor.className).to.equal(className)
  })
}

describe('K.MessageThread', function () {

  describe('Relations', function () {

    describe('messages', function () {

      it('Should return an array with proper Messages', function (doneTest) {
        K.MessageThread.query()
          .where('id', 1)
          .include('messages')
          .then(function (threads) {
            var thread = threads[0]

            expect(thread.messages).to.be.an('array')
            constructorLoop(thread.messages, 'Message')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('senderEntity', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.MessageThread.query()
          .where('id', 1)
          .include('senderEntity')
          .then(function (threads) {
            var thread = threads[0]

            expect(thread.senderEntity).to.be.an('object')
            expect(thread.senderEntity.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('senderPerson', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.MessageThread.query()
          .where('id', 1)
          .include('senderPerson')
          .then(function (threads) {
            var thread = threads[0]

            expect(thread.senderPerson).to.be.an('object')
            expect(thread.senderPerson.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('receiverEntity', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.MessageThread.query()
          .where('id', 1)
          .include('receiverEntity')
          .then(function (threads) {
            var thread = threads[0]

            expect(thread.receiverEntity).to.be.an('object')
            expect(thread.receiverEntity.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
