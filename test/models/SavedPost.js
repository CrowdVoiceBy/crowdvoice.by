'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.SavedPost', function () {

  describe('Relations', function () {

    describe('entity', function () {

      it('Should return a proper Entity object', function (doneTest) {
        K.SavedPost.query()
          .where('id', 1)
          .include('entity')
          .then(function (result) {
            var saved = result[0]

            expect(saved.entity).to.be.an('object')
            expect(saved.entity.constructor.className).to.equal('Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('post', function () {

      it('Should return a proper Post object', function (doneTest) {
        K.SavedPost.query()
          .where('id', 1)
          .include('post')
          .then(function (result) {
            var saved = result[0]

            expect(saved.post).to.be.an('object')
            expect(saved.post.constructor.className).to.equal('Post')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

})
