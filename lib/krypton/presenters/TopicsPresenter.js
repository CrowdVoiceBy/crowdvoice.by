'use strict'

K.TopicsPresenter = Module(K, 'TopicsPresenter')({

  build: function (topics) {
    return new Promise(function (resolve, reject) {
      var response = []

      async.eachLimit(topics, 1, function (topic, nextTopic) {
        if (topic.deleted) {
          return nextTopic()
        }

        var fetchTopic

        var topicInstance = new K.Topic(topic)

        // Hashids

        topicInstance.id = hashids.encode(topicInstance.id)

        // Images

        var images = {}

        Object.keys(topicInstance.imageMeta).forEach(function (version) {
          images[version] = {
            url: topicInstance.image.url(version),
            meta: topicInstance.image.meta(version),
          }
        })

        topicInstance.images = images

        delete topicInstance.imageBaseUrl
        delete topicInstance.imageMeta

        // Other stuff

        return Promise.resolve()
          .then(function () {
            return K.Topic.query()
              .where('id', topic.id)
              .include('voices')
              .then(function (topic) {
                fetchTopic = topic[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            topicInstance.voicesCount = fetchTopic.voices.filter(function (v) {
              return v.status = Voice.STATUS_PUBLISHED
            }).length

            return Promise.resolve()
          })
          .then(function () {
            response.push(topicInstance)

            return nextTopic()
          })
          .catch(nextTopic)
      }, function (err) {
        if (err) { return reject(err) }

        return resolve(response)
      })
    })
  },

})

module.exports = K.TopicsPresenter
