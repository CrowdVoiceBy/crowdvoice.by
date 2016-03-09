'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.VoiceFollower', function () {

  describe('Relations', function () {

    describe('voice', function () {

      it('Should return a proper Voice object', function (doneTest) {
        K.VoiceFollower.query()
          .where('id', 1)
          .include('voice')
          .then(function (result) {
            var follower = result[0]

            expect(follower.voice).to.be.an('object')
            expect(follower.voice.constructor.className).to.equal('Voice')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('follower', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.VoiceFollower.query()
          .where('id', 1)
          .include('follower')
          .then(function (result) {
            var follower = result[0]

            expect(follower.follower).to.be.an('object')
            expect(follower.follower.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
