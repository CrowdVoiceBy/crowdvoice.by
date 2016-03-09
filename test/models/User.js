'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.User', function () {

  describe('Relations', function () {

    describe('entity', function () {

      it('Should return a proper Entity', function (doneTest) {
        K.User.query()
          .where('id', 1)
          .include('entity')
          .then(function (result) {
            var topic = result[0]

            expect(topic.entity).to.be.an('object')
            expect(topic.entity.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
