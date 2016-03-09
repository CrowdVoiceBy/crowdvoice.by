'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

var constructorLoop = function (array, className) {
  array.forEach(function (a) {
    expect(a.constructor.className).to.equal(className)
  })
}

describe('K.Topic', function () {

  describe('Relations', function () {

    describe('voices', function () {

      it('Should return an array proper Voices', function (doneTest) {
        K.Topic.query()
          .where('id', 1)
          .include('voices')
          .then(function (result) {
            var topic = result[0]

            expect(topic.voices).to.be.an('array')
            expect(topic.voices.length).to.equal(6)
            constructorLoop(topic.voices, 'Voice')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
