'use strict'

var casual = require('casual')

K.EntitiesPresenter = Module(K, 'EntitiesPresenter')({

  build: function (entities, currentPerson) {
    return new Promise(function (resolve, reject) {
      var response = []

      async.eachLimit(entities, 1, function (entity, nextEntity) {
        if (entity.deleted) {
          return nextEntity()
        }

        var fetchEntity, fetchCurrentPerson

        var entityInstance = new K.Entity(entity)

        // Hashids
        entityInstance.id = hashids.encode(entityInstance.id)

        // Images

        var images = {}

        Object.keys(entityInstance.image.versions).forEach(function (version) {
          images[version] = {
            url: entityInstance.image.url(version),
            meta: entityInstance.image.meta(version),
          }

          if (entityInstance.isAnonymous) {
            images[version].url = '/img/anonymous/' + casual.integer(1, 9) + '/image_' + version + '.png'
          } else {
            if (!images[version].url) {
              images[version].url = '/img/entity-placeholder/image_' + version + '.png'
            }
          }
        })

        entityInstance.images = images

        delete entityInstance.imageMeta
        delete entityInstance.imageBaseUrl

        // Backgrounds

        var backgrounds = {}

        Object.keys(entityInstance.backgroundMeta).forEach(function (version) {
          backgrounds[version] = {
            url: entityInstance.background.url(version),
            meta: entityInstance.background.meta(version),
          }
        })

        entityInstance.backgrounds = backgrounds

        delete entityInstance.backgroundMeta
        delete entityInstance.backgroundBaseUrl

        // Other stuff

        Promise.resolve()
          .then(function () {
            return K.Entity.query()
              .where('id', entity.id)
              .include('[organizations,memberOrganizations,voices,contributedVoices,followedVoices]')
              .then(function (entity) {
                fetchEntity = entity[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            if (!currentPerson) {
              return Promise.resolve()
            }

            var includeString = 'organizations'

            if (currentPerson.isAnonymous) {
              return K.Entity.query()
                .where('id', hashids.decode(currentPerson.id)[0])
                .then(function (anonymousEntity) {
                  return anonymousEntity.getRealEntity()
                    .then(function (realEntity) {
                      return K.Entity.query()
                        .where('id', realEntity.id)
                        .include(includeString)
                        .then(function (entity) {
                          fetchCurrentPerson = entity[0]

                          return Promise.resolve()
                        })
                    })
                })
            } else {
              return K.Entity.query()
                .where('id', hashids.decode(currentPerson.id)[0])
                .include(includeString)
                .then(function (entity) {
                  fetchCurrentPerson = entity[0]

                  return Promise.resolve()
                })
            }
          })
          .then(function () {
            return K.Voice.query()
              .count('*')
              .where('owner_id', entity.id)
              .andWhere('status', Voice.STATUS_PUBLISHED)
              .then(function (count) {
                entityInstance.voicesCount = +count[0].count

                return Promise.resolve()
              })
          })
          .then(function () {
            return K.EntityFollower.query()
              .count('*')
              .where('followed_id', entity.id)
              .then(function (count) {
                entityInstance.followersCount = +count[0].count

                return Promise.resolve()
              })
          })
          .then(function () {
            return K.EntityFollower.query()
              .count('*')
              .where('follower_id', entity.id)
              .then(function (count) {
                entityInstance.followingCount = +count[0].count

                return Promise.resolve()
              })
          })
          .then(function () {
            entityInstance.followingCount += fetchEntity.followedVoices.filter(function (v) {
              return v.status === Voice.STATUS_PUBLISHED
            }).length

            return Promise.resolve()
          })
          .then(function () {
            return K.EntityMembership.query()
              .count('*')
              .where('entity_id', entity.id)
              .then(function (count) {
                entityInstance.membershipCount = +count[0].count

                return Promise.resolve()
              })
          })
          .then(function () {
            var ids = []

            ids = ids.concat(fetchEntity.organizations.map(function (org) { return hashids.encode(org.id) }))
            ids = ids.concat(fetchEntity.memberOrganizations.map(function (org) { return hashids.encode(org.id) }))

            entityInstance.organizationIds = ids
          })
          .then(function () {
            var ids = []

            ids = ids.concat(fetchEntity.voices.map(function (voice) { return hashids.encode(voice.id) }))
            ids = ids.concat(fetchEntity.contributedVoices.map(function (voice) { return hashids.encode(voice.id) }))

            entityInstance.voiceIds = ids
          })
          .then(function () {
            if (!currentPerson) {
              entityInstance.followed = false
              return Promise.resolve()
            }

            return K.EntityFollower.query()
              .count('*')
              .where('follower_id', fetchCurrentPerson.id)
              .andWhere('followed_id', entity.id)
              .then(function (count) {
                entityInstance.followed = +count[0].count > 0

                return Promise.resolve()
              })
          })
          .then(function () {
            if (!currentPerson) {
              entityInstance.followersOwnedByCurrentPerson = []
              return Promise.resolve()
            }

            var ids = [fetchCurrentPerson.id]

            ids = ids.concat(fetchCurrentPerson.organizations.map(function (org) { return org.id }))

            return K.EntityFollower.query()
              .select('follower_id')
              .where('followed_id', entity.id)
              .andWhere('follower_id', 'in', ids)
              .then(function (followers) {
                entityInstance.followersOwnedByCurrentPerson = followers.map(function (f) {
                  return hashids.encode(f.follower_id)
                })

                return Promise.resolve()
              })
          })
          .then(function () {
            if (!currentPerson) {
              entityInstance.followsCurrentPerson = false
              return Promise.resolve()
            }

            return K.EntityFollower.query()
              .count('*')
              .where('follower_id', entity.id)
              .andWhere('followed_id', fetchCurrentPerson.id)
              .then(function (count) {
                entityInstance.followsCurrentPerson = +count[0].count > 0

                return Promise.resolve()
              })
          })
          .then(function () {
            response.push(entityInstance)

            return nextEntity()
          })
          .catch(nextEntity)
      }, function (err) {
        if (err) { return reject(err) }

        return resolve(response)
      })
    })
  },

})

module.exports = K.EntitiesPresenter
