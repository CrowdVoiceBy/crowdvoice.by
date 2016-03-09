'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

describe('K.TopicsPresenter', function () {

  describe('#build', function () {

    it('Should return the correct properties with the correct types', function (doneTest) {
      K.Topic.query()
        .where('id', 1)
        .then(function (topic) {
          return K.TopicsPresenter.build(topic, null)
        })
        .then(function (pres) {
          var topic = pres[0]

          // Presenter
          expect(topic.id).to.be.a('string')
          expect(topic.images).to.be.an('object')
          expect(topic.voicesCount).to.be.a('number')

          // Normal model
          expect(topic.name).to.be.a('string')
          expect(topic.slug).to.be.a('string')
          expect(topic.imageBaseUrl).to.not.exist
          expect(topic.imageMeta).to.not.exist
          expect(topic.createdAt instanceof Date).to.equal(true)
          expect(topic.updatedAt instanceof Date).to.equal(true)
          expect(topic.deleted).to.be.a('boolean')

          return doneTest()
        })
        .catch(doneTest)
    })

  })

})
