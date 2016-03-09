'use strict'

var sanitize = require('sanitize-html')

K.VoicesPresenter = Module(K, 'VoicesPresenter')({

  build: function (voices, currentPerson) {
    return new Promise(function (resolve, reject) {
      var response = []

      async.eachLimit(voices, 1, function (voice, nextVoice) {
        if (voice.deleted) {
          return nextVoice()
        }

        var fetchVoice, fetchCurrentPerson

        var voiceInstance = new K.Voice(voice)

        // Hashids

        voiceInstance.id = hashids.encode(voiceInstance.id)

        // Sanitize

        voiceInstance.title = sanitize(voiceInstance.title)
        voiceInstance.description = sanitize(voiceInstance.description)
        voiceInstance.twitterSearch = sanitize(voiceInstance.twitterSearch)
        voiceInstance.locationName = sanitize(voiceInstance.locationName)
        voiceInstance.longitude = sanitize(voiceInstance.longitude)
        voiceInstance.latitude = sanitize(voiceInstance.latitude)

        // Images

        var images = {}

        Object.keys(voiceInstance.imageMeta).forEach(function (version) {
          images[version] = {
            url: voiceInstance.image.url(version),
            meta: voiceInstance.image.meta(version),
          }
        })

        voiceInstance.images = images

        delete voiceInstance.imageMeta
        delete voiceInstance.imageBaseUrl

        // Other stuff

        Promise.resolve()
          .then(function () {
            return K.Voice.query()
              .where('id', voice.id)
              .include('[slug,owner,topics,followers]')
              .then(function (voice) {
                fetchVoice = voice[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            if (!currentPerson) {
              return Promise.resolve()
            }

            var include = 'organizations'

            if (currentPerson.isAnonymous) {
              return K.Entity.query()
                .where('id', hashids.decode(currentPerson.id)[0])
                .then(function (anonymousEntity) {
                  return anonymousEntity.getRealEntity()
                    .then(function (realEntity) {
                      return K.Entity.query()
                        .where('id', realEntity.id)
                        .include(include)
                        .then(function (entity) {
                          fetchCurrentPerson = entity[0]

                          return Promise.resolve()
                        })
                    })
                })
            } else {
              return K.Entity.query()
                .where('id', hashids.decode(currentPerson.id)[0])
                .include(include)
                .then(function (entity) {
                  fetchCurrentPerson = entity[0]

                  return Promise.resolve()
                })
            }
          })
          .then(function () {
            voiceInstance.slug = fetchVoice.slug.url

            return Promise.resolve()
          })
          .then(function () {
            return K.EntitiesPresenter.build([fetchVoice.owner], currentPerson)
              .then(function (pres) {
                voiceInstance.owner = pres[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            return K.TopicsPresenter.build(fetchVoice.topics, currentPerson)
              .then(function (pres) {
                voiceInstance.topics = pres

                return Promise.resolve()
              })
          })
          .then(function () {
            return K.EntitiesPresenter.build(fetchVoice.followers, currentPerson)
              .then(function (pres) {
                voiceInstance.followers = pres

                if (currentPerson) {
                  voiceInstance.followed = (fetchVoice.followers.filter(function (f) {
                    return f.id === fetchCurrentPerson.id
                  }).length > 0)
                } else {
                  voiceInstance.followed = false
                }

                return Promise.resolve()
              })
          })
          .then(function () {
            if (!currentPerson) {
              voiceInstance.followersOwnedByCurrentPerson = []
              return Promise.resolve()
            }

            var ids = [fetchCurrentPerson.id]

            ids = ids.concat(fetchCurrentPerson.organizations.map(function (org) { return org.id }))

            return K.VoiceFollower.query()
              .select('entity_id')
              .where('voice_id', voice.id)
              .andWhere('entity_id', 'in', ids)
              .then(function (followers) {
                voiceInstance.followersOwnedByCurrentPerson = followers.map(function (f) {
                  return hashids.encode(f.entityId)
                })

                return Promise.resolve()
              })
          })
          .then(function () {
            return K.Post.query()
              .count('*')
              .where('voice_id', '=', voice.id)
              .andWhere('approved', true)
              .then(function (count) {
                voiceInstance.postsCount = +count[0].count

                return Promise.resolve()
              })
          })
          .then(function () {
            delete voiceInstance.ownerId

            response.push(voiceInstance)

            return nextVoice()
          })
          .catch(nextVoice)
      }, function (err) {
        if (err) { return reject(err) }

        return resolve(response)
      })
    })
  },

})

module.exports = K.VoicesPresenter
