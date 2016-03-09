'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.VoicesPresenter', function () {

  describe('#build', function () {

    it('Should return the correct properties with the correct types', function (doneTest) {
      K.Voice.query()
        .where('id', 1)
        .then(function (voice) {
          return K.VoicesPresenter.build(voice, null)
        })
        .then(function (pres) {
          var voice = pres[0]

          // Presenter
          expect(voice.id).to.be.a('string')
          expect(voice.title).to.be.a('string')
          expect(voice.description).to.be.a('string')
          expect(voice.twitterSearch).to.be.a('string')
          expect(voice.locationName).to.be.a('string')
          expect(voice.longitude).to.be.a('string')
          expect(voice.latitude).to.be.a('string')
          expect(voice.images).to.be.an('object')
          expect(voice.slug).to.be.a('string')
          expect(voice.owner).to.be.an('object')
          expect(voice.topics).to.be.an('array')
          expect(voice.followers).to.be.an('array')
          expect(voice.followed).to.be.a('boolean')
          expect(voice.followersOwnedByCurrentPerson).to.be.an('array')
          expect(voice.postsCount).to.be.a('number')

          // Normal model
          expect(voice.imageMeta).to.not.exist
          expect(voice.imageBaseUrl).to.not.exist
          expect(voice.ownerId).to.not.exist
          expect(voice.status).to.be.a('string')
          expect(voice.type).to.be.a('string')
          expect(voice.twitterSearch).to.be.a('string')
          expect(voice.hasOwnProperty('tweetLastFetchAt')).to.equal(true)
          expect(voice.hasOwnProperty('rssUrl')).to.equal(true)
          expect(voice.hasOwnProperty('rssLastFetchAt')).to.equal(true)
          expect(voice.createdAt instanceof Date).to.equal(true)
          expect(voice.updatedAt instanceof Date).to.equal(true)
          expect(voice.deleted).to.be.a('boolean')

          return doneTest()
        })
        .catch(doneTest)
    })

  })

})
