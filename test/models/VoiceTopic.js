'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.VoiceTopic', function () {

  describe('Relations', function () {

    describe('voice', function () {

      it('Should return a proper Voice object', function (doneTest) {
        K.VoiceTopic.query()
          .where('id', 1)
          .include('voice')
          .then(function (result) {
            var topic = result[0]

            expect(topic.voice).to.be.an('object')
            expect(topic.voice.constructor.className).to.equal('Voice')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('topic', function () {

      it('Should return a proper Topic object', function (doneTest) {
        K.VoiceTopic.query()
          .where('id', 1)
          .include('topic')
          .then(function (result) {
            var topic = result[0]

            expect(topic.topic).to.be.an('object')
            expect(topic.topic.constructor.className).to.equal('Topic')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
