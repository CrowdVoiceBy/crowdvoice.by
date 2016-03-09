'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.log = function () {}

var expect = require('chai').expect

describe('K.MessagesPresenter', function () {

  describe('#build', function () {

    it('Should return the correct properties with the correct types', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (entity) {
          return K.EntitiesPresenter.build(entity, null)
        })
        .then(function (pres) {
          var tyrion = pres[0]

          return K.Message.query()
            .where('sender_entity_id', '=', 1)
            .orWhere('receiver_entity_id', '=', 1)
            .then(function (thread) {
              return K.MessagesPresenter.build(thread, tyrion)
            })
        })
        .then(function (pres) {
          var message = pres[0]

          expect(message.id).to.be.a('string')
          expect(message.type).to.be.a('string')
          expect(message.threadId).to.be.a('string')
          expect(message.message).to.be.a('string')
          expect(message.senderEntity).to.be.an('object')
          expect(message.hasOwnProperty('voice')).to.equal(true)
          expect(message.hasOwnProperty('organization')).to.equal(true)

          expect(message.createdAt instanceof Date).to.equal(true)
          expect(message.updatedAt instanceof Date).to.equal(true)

          return doneTest()
        })
        .catch(doneTest)
    })

  })

})
