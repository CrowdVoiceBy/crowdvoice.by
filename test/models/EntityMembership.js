'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.EntityMembership', function () {

  describe('Relations', function () {

    describe('organization', function () {

      it('Should return proper House Stark Entity', function (doneTest) {
        K.EntityMembership.query()
          .where('id', 1)
          .include('organization')
          .then(function (result) {
            var record = result[0]

            expect(record.organization).to.be.an('object')
            expect(record.organization.constructor.className).to.equal('Entity')
            expect(record.organization.id).to.equal(21)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('member', function () {

      it('Should return proper Arya Entity', function (doneTest) {
        K.EntityMembership.query()
          .where('id', 1)
          .include('member')
          .then(function (result) {
            var record = result[0]

            expect(record.member).to.be.an('object')
            expect(record.member.constructor.className).to.equal('Entity')
            expect(record.member.id).to.equal(11)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
