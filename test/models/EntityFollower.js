'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.EntityFollower', function () {

  describe('Relations', function () {

    describe('follower', function () {

      it('Should return proper Tyrion Entity', function (doneTest) {
        K.EntityFollower.query()
          .where('id', 1)
          .include('follower')
          .then(function (result) {
            var record = result[0]

            expect(record.follower).to.be.an('object')
            expect(record.follower.constructor.className).to.equal('Entity')
            expect(record.follower.id).to.equal(1)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('followed', function () {

      it('Should return proper Jaime Entity', function (doneTest) {
        K.EntityFollower.query()
          .where('id', 1)
          .include('followed')
          .then(function (result) {
            var record = result[0]

            expect(record.followed).to.be.an('object')
            expect(record.followed.constructor.className).to.equal('Entity')
            expect(record.followed.id).to.equal(5)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
