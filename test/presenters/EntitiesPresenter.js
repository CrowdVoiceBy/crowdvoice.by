'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.EntitiesPresenter', function () {

  describe('#build', function () {

    it('Should return the correct properties with the correct types', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (tyrion) {
          return K.EntitiesPresenter.build(tyrion, null)
        })
        .then(function (pres) {
          var tyrion = pres[0]

          // Presenter
          expect(tyrion.id).to.be.a('string')
          expect(tyrion.images).to.be.an('object')
          expect(tyrion.backgrounds).to.be.an('object')
          expect(tyrion.voicesCount).to.be.a('number')
          expect(tyrion.followersCount).to.be.a('number')
          expect(tyrion.followingCount).to.be.a('number')
          expect(tyrion.membershipCount).to.be.a('number')
          expect(tyrion.organizationIds).to.be.an('array')
          expect(tyrion.voiceIds).to.be.an('array')
          expect(tyrion.followed).to.be.a('boolean')
          expect(tyrion.followersOwnedByCurrentPerson).to.be.an('array')
          expect(tyrion.followsCurrentPerson).to.be.a('boolean')

          // Normal model
          expect(tyrion.type).to.be.a('string')
          expect(tyrion.name).to.be.a('string')
          expect(tyrion.lastname).to.be.null
          expect(tyrion.profileName).to.be.a('string')
          expect(tyrion.isAnonymous).to.be.a('boolean')
          expect(tyrion.isAdmin).to.be.a('boolean')
          expect(tyrion.description).to.be.a('string')
          expect(tyrion.location).to.be.a('string')
          expect(tyrion.imageMeta).to.not.exist
          expect(tyrion.imageBaseUrl).to.not.exist
          expect(tyrion.backgroundMeta).to.not.exist
          expect(tyrion.backgroundBaseUrl).to.not.exist
          expect(tyrion.createdAt instanceof Date).to.equal(true)
          expect(tyrion.updatedAt instanceof Date).to.equal(true)
          expect(tyrion.deleted).to.be.a('boolean')

          return doneTest()
        })
        .catch(doneTest)
    })

  })

})
