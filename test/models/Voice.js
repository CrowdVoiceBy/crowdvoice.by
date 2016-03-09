/**
 * NOTE:
 * These tests require the following stuff to have been done before being run in
 * order tfor all tests to pass.
 *
 * DELETE FROM "Posts" WHERE voice_id = 15
 *
 * $ node bin/posts_generator.js 15 20
 */

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

var propertyLoop = function (array, propertyName, value) {
  array.forEach(function (a) {
    expect(a[propertyName]).to.equal(value)
  })
}

describe('K.Voice', function () {

  describe('Relations', function () {

    describe('owner', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.Voice.query()
          .where('id', 1)
          .include('owner')
          .then(function (result) {
            var voice = result[0]

            expect(voice.owner).to.be.an('object')
            expect(voice.owner.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('slug', function () {

      it('Should return a proper Slug object', function (doneTest) {
        K.Voice.query()
          .where('id', 1)
          .include('slug')
          .then(function (result) {
            var voice = result[0]

            expect(voice.slug).to.be.an('object')
            expect(voice.slug.constructor.className).to.equal('Slug')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('collaborators', function () {

      it('Should return an array with proper Entities', function (doneTest) {
        K.Voice.query()
          .where('id', 4)
          .include('collaborators')
          .then(function (result) {
            var voice = result[0]

            expect(voice.collaborators).to.be.an('array')
            expect(voice.collaborators.length).to.equal(1)
            constructorLoop(voice.collaborators, 'Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('approvedPosts', function () {

      it('Should return an array with proper (approved) Posts', function (doneTest) {
        K.Voice.query()
          .where('id', 15)
          .include('approvedPosts')
          .then(function (result) {
            var voice = result[0]

            expect(voice.approvedPosts).to.be.an('array')
            constructorLoop(voice.approvedPosts, 'Post')
            propertyLoop(voice.approvedPosts, 'approved', true)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('unapprovedPosts', function () {

      it('Should return an array with proper (unapproved) Posts', function (doneTest) {
        K.Voice.query()
          .where('id', 15)
          .include('unapprovedPosts')
          .then(function (result) {
            var voice = result[0]

            expect(voice.unapprovedPosts).to.be.an('array')
            constructorLoop(voice.unapprovedPosts, 'Post')
            propertyLoop(voice.unapprovedPosts, 'approved', false)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('followers', function () {

      it('Should return an array with proper Entities', function (doneTest) {
        K.Voice.query()
          .where('id', 15)
          .include('followers')
          .then(function (result) {
            var voice = result[0]

            expect(voice.followers).to.be.an('array')
            expect(voice.followers.length).to.equal(3)
            constructorLoop(voice.followers, 'Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('topics', function () {

      it('Should return an array with proper Topics', function (doneTest) {
        K.Voice.query()
          .where('id', 15)
          .include('topics')
          .then(function (result) {
            var voice = result[0]

            expect(voice.topics).to.be.an('array')
            expect(voice.topics.length).to.equal(1)
            constructorLoop(voice.topics, 'Topic')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('relatedVoices', function () {

      it('Should return an array with proper Voices', function (doneTest) {
        K.Voice.query()
          .where('id', 1)
          .include('relatedVoices')
          .then(function (result) {
            var voice = result[0]

            expect(voice.relatedVoices).to.be.an('array')
            expect(voice.relatedVoices.length).to.equal(1)
            constructorLoop(voice.relatedVoices, 'Voice')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

  describe('#getPostsCount', function () {

    it('Should return a count (Number)', function (doneTest) {
      K.Voice.query()
        .where('id', 15)
        .then(function (result) {
          var voice = result[0]

          voice.getPostsCount()
            .then(function (result) {
              expect(result).to.be.a('number')
              expect(result).to.equal(20)

              return doneTest()
            })
            .catch(doneTest)
        })
        .catch(doneTest)
    })

  })

  describe('#isFollowedBy', function () {

    it('Should return true for Tyrion following Walk of Atonement', function (doneTest) {
      K.Voice.query()
        .where('id', 15)
        .then(function (result) {
          var voice = result[0]

          voice.isFollowedBy(new K.Entity({ id: 1 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(true)

              return doneTest()
            })
            .catch(doneTest)
        })
        .catch(doneTest)
    })

    it('Should return false for Cersei following The Death of Jon Arryn', function (doneTest) {
      K.Voice.query()
        .where('id', 7)
        .then(function (result) {
          var voice = result[0]

          voice.isFollowedBy(new K.Entity({ id: 3 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(false)

              return doneTest()
            })
            .catch(doneTest)
        })
        .catch(doneTest)
    })

  })

})
