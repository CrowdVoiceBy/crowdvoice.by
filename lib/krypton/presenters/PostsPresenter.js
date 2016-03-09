'use strict'

var sanitize = require('sanitize-html')

K.PostsPresenter = Module(K, 'PostsPresenter')({

  build: function (posts, currentPerson) {
    return new Promise(function (resolve, reject) {
      var response = []

      async.eachLimit(posts, 1, function (post, nextPost) {
        var fetchPost, fetchCurrentPerson

        var postInstance = new K.Post(post)

        // Hashids

        postInstance.id = hashids.encode(postInstance.id)
        postInstance.voiceId = hashids.encode(postInstance.voiceId)
        postInstance.ownerId = hashids.encode(postInstance.ownerId)
        postInstance.title = sanitize(postInstance.title) || 'No title'
        postInstance.description = sanitize(postInstance.description) || 'No description'

        // Images

        var images = {}

        Object.keys(postInstance.imageMeta).forEach(function (version) {
          images[version] = {
            url: postInstance.image.url(version),
            meta: postInstance.image.meta(version),
          }
        })

        postInstance.postImages = images

        // Favicon

        if (post.faviconPath) {
          if (CONFIG.environment === 'development') {
            postInstance.faviconPath = '/uploads/favicons/' + post.faviconPath
          } else {
            postInstance.faviconPath = '//s3.amazonaws.com/crowdvoice.by/' + CONFIG.environment + '/favicons/' + post.faviconPath
          }
        }

        // Other stuff

        return Promise.resolve()
          .then(function () {
            return K.Post.query()
              .where('id', post.id)
              .include('voice.[slug,owner]')
              .then(function (post) {
                fetchPost = post[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            if (!currentPerson) {
              return Promise.resolve()
            }

            if (currentPerson.isAnonymous) {
              return K.Entity.query()
                .where('id', hashids.decode(currentPerson.id)[0])
                .then(function (anonymousEntity) {
                  return anonymousEntity.getRealEntity()
                    .then(function (realEntity) {
                      return K.Entity.query()
                        .where('id', realEntity.id)
                        .then(function (entity) {
                          fetchCurrentPerson = entity[0]

                          return Promise.resolve()
                        })
                    })
                })
            } else {
              return K.Entity.query()
                .where('id', hashids.decode(currentPerson.id)[0])
                .then(function (entity) {
                  fetchCurrentPerson = entity[0]

                  return Promise.resolve()
                })
            }
          })
          .then(function () {
            if (!currentPerson) {
              postInstance.voted = false
              return Promise.resolve()
            }

            return K.Vote.query()
              .count('*')
              .where('post_id', post.id)
              .andWhere('entity_id', fetchCurrentPerson.id)
              .then(function (count) {
                postInstance.voted = +count[0].count > 0

                return Promise.resolve()
              })
          })
          .then(function () {
            if (!currentPerson) {
              postInstance.saved = false
              return Promise.resolve()
            }

            return K.SavedPost.query()
              .count('*')
              .where('post_id', post.id)
              .andWhere('entity_id', fetchCurrentPerson.id)
              .then(function (count) {
                postInstance.saved = +count[0].count > 0

                return Promise.resolve()
              })
          })
          .then(function () {
            return K.SavedPost.query()
              .count('*')
              .where('post_id', post.id)
              .then(function (count) {
                postInstance.totalSaves = +count[0].count

                return Promise.resolve()
              })
          })
          .then(function () {
            postInstance.voice = {
              title: fetchPost.voice.title,
              slug: fetchPost.voice.slug.url,
              owner: {
                name: fetchPost.voice.owner.name,
                profileName: fetchPost.voice.owner.profileName,
              },
              id : postInstance.voiceId
            }

            return Promise.resolve()
          })
          .then(function () {
            response.push(postInstance)

            return nextPost()
          })
          .catch(nextPost)
      }, function (err) {
        if (err) { return reject(err) }

        return resolve(response)
      })
    })
  },

})

module.exports = K.PostsPresenter
