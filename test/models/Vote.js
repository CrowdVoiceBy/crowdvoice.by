'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.VoiceVote', function () {

  describe('Relations', function () {

    describe('voice', function () {

      it('Should return a proper Post object', function (doneTest) {
        K.Vote.query()
          .where('id', 1)
          .include('post')
          .then(function (result) {
            var vote = result[0]

            expect(vote.post).to.be.an('object')
            expect(vote.post.constructor.className).to.equal('Post')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('entity', function () {

      it('Should return a proper Topic object', function (doneTest) {
        K.Vote.query()
          .where('id', 1)
          .include('entity')
          .then(function (result) {
            var vote = result[0]

            expect(vote.entity).to.be.an('object')
            expect(vote.entity.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
