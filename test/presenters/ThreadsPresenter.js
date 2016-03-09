'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.log = function () {}

var expect = require('chai').expect

describe('K.ThreadsPresenter', function () {

  describe('#build', function () {

    it('Should return the correct properties with the correct types', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (entity) {
          return K.EntitiesPresenter.build(entity, null)
        })
        .then(function (pres) {
          var tyrion = pres[0]

          return K.MessageThread.query()
            .where('sender_entity_id', '=', 1)
            .orWhere('receiver_entity_id', '=', 1)
            .then(function (thread) {
              return K.ThreadsPresenter.build(thread, tyrion)
            })
        })
        .then(function (pres) {
          var thread = pres[0]

          expect(thread.id).to.be.a('string')
          expect(thread.hasOwnProperty('lastSeen')).to.equal(true)
          expect(thread.totalMessages).to.be.a('number')
          expect(thread.unreadCount).to.be.a('number')
          expect(thread.senderEntity).to.be.an('object')
          expect(thread.senderPerson).to.be.an('object')
          expect(thread.receiverEntity).to.be.an('object')
          expect(thread.latestMessageContent).to.be.a('string')

          expect(thread.createdAt instanceof Date).to.equal(true)
          expect(thread.updatedAt instanceof Date).to.equal(true)

          return doneTest()
        })
        .catch(doneTest)
    })

  })

})
