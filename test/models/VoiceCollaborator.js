'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.VoiceCollaborator', function () {

  describe('Relations', function () {

    describe('voice', function () {

      it('Should return a proper Voice object', function (doneTest) {
        K.VoiceCollaborator.query()
          .where('id', 1)
          .include('voice')
          .then(function (result) {
            var collab = result[0]

            expect(collab.voice).to.be.an('object')
            expect(collab.voice.constructor.className).to.equal('Voice')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('collaborator', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.VoiceCollaborator.query()
          .where('id', 1)
          .include('collaborator')
          .then(function (result) {
            var collab = result[0]

            expect(collab.collaborator).to.be.an('object')
            expect(collab.collaborator.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
