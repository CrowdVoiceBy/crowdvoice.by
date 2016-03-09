'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.Slug', function () {

  describe('Relations', function () {

    describe('voice', function () {

      it('Should return a proper Voice object', function (doneTest) {
        K.Slug.query()
          .where('id', 1)
          .include('voice')
          .then(function (result) {
            var slug = result[0]

            expect(slug.voice).to.be.an('object')
            expect(slug.voice.constructor.className).to.equal('Voice')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
