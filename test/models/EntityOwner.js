'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.EntityOwner', function () {

  describe('Relations', function () {

    describe('owner', function () {

      it('Should return proper Tyrion Entity', function (doneTest) {
        K.EntityOwner.query()
          .where('id', 1)
          .include('owner')
          .then(function (result) {
            var record = result[0]

            expect(record.owner).to.be.an('object')
            expect(record.owner.constructor.className).to.equal('Entity')
            expect(record.owner.id).to.equal(1)

            return doneTest()
          })
          .catch(doneTest)
      })

      it('Should return proper Cersei Entity', function (doneTest) {
        K.EntityOwner.query()
          .where('id', 12)
          .include('owner')
          .then(function (result) {
            var record = result[0]

            expect(record.owner).to.be.an('object')
            expect(record.owner.constructor.className).to.equal('Entity')
            expect(record.owner.id).to.equal(3)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('owned', function () {

      it('Should return proper Anonymous Entity (Tyrion)', function (doneTest) {
        K.EntityOwner.query()
          .where('id', 1)
          .include('owned')
          .then(function (result) {
            var record = result[0]

            expect(record.owned).to.be.an('object')
            expect(record.owned.constructor.className).to.equal('Entity')
            expect(record.owned.id).to.equal(2)
            expect(record.owned.isAnonymous).to.equal(true)

            return doneTest()
          })
          .catch(doneTest)
      })

      it('Should return proper House Lannister Entity (Cersei)', function (doneTest) {
        K.EntityOwner.query()
          .where('id', 12)
          .include('owned')
          .then(function (result) {
            var record = result[0]

            expect(record.owned).to.be.an('object')
            expect(record.owned.constructor.className).to.equal('Entity')
            expect(record.owned.id).to.equal(22)
            expect(record.owned.type).to.equal('organization')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
