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

describe('K.Post', function () {

  describe('Relations', function () {

    describe('voice', function () {

      it('Should return a proper Voice object', function (doneTest) {
        K.Post.query()
          .where('voice_id', 15)
          .limit(1)
          .include('voice')
          .then(function (posts) {
            var post = posts[0]

            expect(post.voice).to.be.an('object')
            expect(post.voice.constructor.className).to.equal('Voice')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('owner', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.Post.query()
          .where('voice_id', 15)
          .limit(1)
          .include('owner')
          .then(function (posts) {
            var post = posts[0]

            expect(post.owner).to.be.an('object')
            expect(post.owner.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('saves', function () {

      it('Should return an array with proper SavedPosts', function (doneTest) {
        K.Post.query()
          .where('voice_id', 15)
          .limit(1)
          .include('saves')
          .then(function (posts) {
            var post = posts[0]

            expect(post.saves).to.be.an('array')
            expect(post.saves.length).to.equal(1)
            constructorLoop(post.saves, 'SavedPost')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('votes', function () {

      it('Should return an array with proper Votes', function (doneTest) {
        K.Post.query()
          .where('voice_id', 15)
          .limit(1)
          .include('votes')
          .then(function (posts) {
            var post = posts[0]

            expect(post.votes).to.be.an('array')
            expect(post.votes.length).to.equal(1)
            constructorLoop(post.votes, 'Vote')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

  describe('#getSavesCount', function () {

    it('Should return a count (Number)', function (doneTest) {
      K.Post.query()
        .where('voice_id', 15)
        .limit(1)
        .include('voice')
        .then(function (posts) {
          var post = posts[0]

          post.getSavesCount()
            .then(function (count) {
              expect(count).to.be.a('number')
              expect(count).to.equal(1)

              return doneTest()
            })
            .catch(doneTest)
        })
        .catch(doneTest)
    })

  })

  describe('#getVotesCount', function () {

    it('Should return a count (Number)', function (doneTest) {
      K.Post.query()
        .where('voice_id', 15)
        .limit(1)
        .include('voice')
        .then(function (posts) {
          var post = posts[0]

          post.getVotesCount()
            .then(function (count) {
              expect(count).to.be.a('number')
              expect(count).to.equal(1)

              return doneTest()
            })
            .catch(doneTest)
        })
        .catch(doneTest)
    })

  })

  describe('#isVotedBy', function () {

    it('Should return true for Cersei having voted', function (doneTest) {
      K.Post.query()
        .where('voice_id', 15)
        .limit(1)
        .include('voice')
        .then(function (posts) {
          var post = posts[0]

          post.isVotedBy(new K.Entity({ id: 3 }))
            .then(function (bool) {
              expect(bool).to.be.a('boolean')
              expect(bool).to.equal(true)

              return doneTest()
            })
            .catch(doneTest)
        })
        .catch(doneTest)
    })

    it('Should return false for Tyrion having voted', function (doneTest) {
      K.Post.query()
        .where('voice_id', 15)
        .limit(1)
        .include('voice')
        .then(function (posts) {
          var post = posts[0]

          post.isVotedBy(new K.Entity({ id: 1 }))
            .then(function (bool) {
              expect(bool).to.be.a('boolean')
              expect(bool).to.equal(false)

              return doneTest()
            })
            .catch(doneTest)
        })
        .catch(doneTest)
    })

  })

  describe('#isSavedBy', function () {

    it('Should return true for Cersei having saved', function (doneTest) {
      K.Post.query()
        .where('voice_id', 15)
        .limit(1)
        .include('voice')
        .then(function (posts) {
          var post = posts[0]

          post.isSavedBy(new K.Entity({ id: 3 }))
            .then(function (bool) {
              expect(bool).to.be.a('boolean')
              expect(bool).to.equal(true)

              return doneTest()
            })
            .catch(doneTest)
        })
        .catch(doneTest)
    })

    it('Should return false for Tyrion having saved', function (doneTest) {
      K.Post.query()
        .where('voice_id', 15)
        .limit(1)
        .include('voice')
        .then(function (posts) {
          var post = posts[0]

          post.isSavedBy(new K.Entity({ id: 1 }))
            .then(function (bool) {
              expect(bool).to.be.a('boolean')
              expect(bool).to.equal(false)

              return doneTest()
            })
            .catch(doneTest)
        })
        .catch(doneTest)
    })

  })

})
