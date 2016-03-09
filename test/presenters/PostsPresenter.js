'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.PostsPresenter', function () {

  describe('#build', function () {

    it('Should return the correct properties with the correct types', function (doneTest) {
      K.Post.query()
        .limit(1)
        .then(function (post) {
          return K.PostsPresenter.build(post, null)
        })
        .then(function (pres) {
          var post = pres[0]

          // Presenter
          expect(post.id).to.be.a('string')
          expect(post.voiceId).to.be.a('string')
          expect(post.ownerId).to.be.a('string')
          expect(post.title).to.be.a('string')
          expect(post.description).to.be.a('string')
          expect(post.postImages).to.be.an('object')
          expect(post.hasOwnProperty('faviconPath')).to.equal(true)
          expect(post.voted).to.be.a('boolean')
          expect(post.saved).to.be.a('boolean')
          expect(post.totalSaves).to.be.a('number')
          expect(post.voice).to.be.an('object')
          expect(post.voice.title).to.be.a('string')
          expect(post.voice.slug).to.be.a('string')
          expect(post.voice.owner).to.be.an('object')
          expect(post.voice.owner.name).to.be.a('string')
          expect(post.voice.owner.profileName).to.be.a('string')

          // Normal model
          expect(post.imageBaseUrl).to.be.a('string')
          expect(post.imageMeta).to.be.an('object')
          expect(post.sourceService).to.be.a('string')
          expect(post.sourceType).to.be.a('string')
          expect(post.sourceUrl).to.be.a('string')
          expect(post.publishedAt instanceof Date).to.equal(true)
          expect(post.createdAt instanceof Date).to.equal(true)
          expect(post.updatedAt instanceof Date).to.equal(true)
          expect(post.sourceDomain).to.be.a('string')

          return doneTest()
        })
        .catch(doneTest)
    })

  })

})
