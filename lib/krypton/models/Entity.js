var _ = require('underscore')
var ImageUploader = require(path.join(process.cwd(), 'lib', 'image_uploader.js'))

K.Entity = Class(K, 'Entity').inherits(Krypton.Model).includes(ImageUploader)({
  tableName: 'Entities',

  attributes: [
    'id',
    'type',
    'name',
    'lastname',
    'profileName',
    'isAnonymous',
    'isAdmin',
    'description',
    'location',
    'imageBaseUrl',
    'imageMeta',
    'backgroundBaseUrl',
    'backgroundMeta',
    'createdAt',
    'updatedAt',
    'deleted'
  ],

  validations: {
    type: [
      'required',
      {
        rule: function (val) {
          if (!val.match(/(person|organization)/)) {
            throw new Checkit.FieldError('Entity type must be person|organization.')
          }
        },
        message: 'Entity type must be person|organization.'
      }
    ],

    name: ['required', 'minLength:1', 'maxLength:512'],

    isAnonymous: ['required', 'boolean'],

    profileName: [
      'required',
      {
        rule: function (val) {
          if (val.match(/[^a-zA-Z0-9_-]/)) {
            throw new Checkit.FieldError('Profile name should only contain letters, numbers and dashes.')
          }
        },
        message: 'Profile name should only contain letters, numbers and dashes.'
      }
    ],

    description: ['maxLength:140']
  },

  prototype: {
    isAnonymous: false,
    description: '',
    location: '',
    deleted: false,

    init: function (config) {
      Krypton.Model.prototype.init.call(this, config)

      var model = this

      this.on('beforeSave', function () {
        model.profileName = model.profileName.toLowerCase().trim()
      })

      // Add image attachment
      this.hasImage({
        propertyName: 'image',
        versions: {
          icon: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(16,16)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .embed()
                .crop(sharp.gravity.center)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
            )
          },
          notification: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(28,28)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .embed()
                .crop(sharp.gravity.center)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
            )
          },
          small: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(36,36)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .embed()
                .crop(sharp.gravity.center)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
            )
          },
          card: function (readStream) {
            return readStream.pipe(
              sharp()
              .resize(88,88)
              .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
              .embed()
              .crop(sharp.gravity.center)
              .progressive()
              .flatten()
              .background('#FFFFFF')
              .quality(100)
            )
          },
          medium: function (readStream) {
            return readStream.pipe(
              sharp()
              .resize(160,160)
              .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
              .embed()
              .crop(sharp.gravity.center)
              .progressive()
              .flatten()
              .background('#FFFFFF')
              .quality(100)
            )
          }
        },
        bucket: 'crowdvoice.by',
        basePath: '{env}/{modelName}_{id}/{property}_{versionName}.{extension}'
      })

      // Add image attachment
      this.hasImage({
        propertyName: 'background',
        versions: {
          card: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(440)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
            )
          },
          bluredCard: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(440)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .blur(5)
                .quality(100)
            )
          },
          big: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(2560, 1113)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .blur(25)
                .quality(100)
            )
          }
        },
        bucket: 'crowdvoice.by',
        basePath: '{env}/{modelName}_{id}/{property}_{versionName}.{extension}'
      })
    },

    getAnonymousEntity: function () {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          throw new Error('K.Entity doesn\'t have an ID')
        }

        if (that.isAnonymous) {
          throw new Error('K.Entity is Anonymous, cannot call #getAnonymousEntity')
        }

        K.Entity.query()
          .select('Entities.*')
          .from('Entities')
          .leftJoin('EntityOwner', 'Entities.id', '=', 'EntityOwner.owned_id')
          .where('Entities.is_anonymous', '=', true)
          .andWhere('EntityOwner.owner_id', '=', that.id)
          .then(function (result) {
            if (result.length > 0) {
              return res(result[0])
            } else {
              return res(null)
            }
          })
          .catch(rej)
      })
    },

    getOwner: function () {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          throw new Error('K.Entity doesn\'t have an ID')
        }

        if (that.type === 'person' && !that.isAnonymous) {
          return res(null)
          // throw new Error('K.Entity is a Person, does not have an owner, cannot call #getOwner')
        }

        K.Entity.query()
          .select('Entities.*')
          .from('Entities')
          .leftJoin('EntityOwner', 'Entities.id', '=', 'EntityOwner.owner_id')
          .where('Entities.type', '=', 'person')
          .andWhere('EntityOwner.owned_id', '=', that.id)
          .then(function (result) {
            if (result.length > 0) {
              return res(result[0])
            } else {
              return res(null)
            }
          })
          .catch(rej)
      })
    },

    getRealEntity: function () {
      if (!this.isAnonymous) {
        return Promise.reject(new Error('K.Entity is not Anonymous, cannot call #getRealEntity'))
      }

      return this.getOwner()
    },

    isOwnerOfEntity: function (entity) {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          throw new Error('K.Entity doesn\'t have an ID')
        }

        K.EntityOwner.query()
          .count('*')
          .where('owner_id', '=', that.id)
          .andWhere('owned_id', '=', entity.id)
          .then(function (owners) {
            return res(+owners[0].count > 0)
          })
          .catch(rej)
      })
    },

    isOwnedBy: function (entity) {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          return rej(new Error('K.Entity doesn\'t have an ID'))
        }

        K.EntityOwner.query()
          .count('*')
          .where('owner_id', '=', entity.id)
          .andWhere('owned_id', '=', that.id)
          .then(function (owners) {
            return res(+owners[0].count > 0)
          })
          .catch(rej)
      })
    },

    isOwnerOfVoice: function (voice) {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          throw new Error('K.Entity doesn\'t have an ID')
        }

        K.Voice.query()
          .count('*')
          .where('owner_id', '=', that.id)
          .andWhere('id', '=', voice.id)
          .then(function (voices) {
            return res(+voices[0].count > 0)
          })
          .catch(rej)
      })
    },

    hasAccessToVoice: function (voice, extraVoices) {
      var that = this

      return new Promise(function (res, rej) {
        var voices = extraVoices || [],
          mapArr = [],
          noRelations = true

        // Gather the voices we can from the model and its relations, so that
        // we can loop through them and see if we can find ^voice in them.

        var voiceRelationNames = [
          'voices',
          'viewableVoices',
          'contributedVoices'
        ]

        var possibleOwnersNames = [
          'this',
          'anonymousEntity',
          'organizations',
          'memberOrganizations'
        ]

        possibleOwnersNames.forEach(function (ownerName) {
          if (ownerName === 'this') {
            voiceRelationNames.forEach(function (relation) {
              if (!that[relation]) {
                return
              }

              noRelations = false

              voices = voices.concat(that[relation])
            })
          } else {
            if (!that[ownerName]) {
              return
            }

            that[ownerName].forEach(function (owner) {
              voiceRelationNames.forEach(function (relation) {
                if (!owner[relation]) {
                  return
                }

                noRelations = false

                voices = voices.concat(owner[relation])
              })
            })
          }
        })

        // No voices to handle, so let's return.
        if (noRelations) {
          throw new Error('Couldn\'t find any voices to check')
        }

        var matchingVoices = []

        matchingVoices = voices.filter(function (v) {
          return (v.id === voice.id)
        })

        return res(matchingVoices.length > 0)
      })
    },

    isFollowedBy: function (entity) {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          throw new Error('K.Entity doesn\'t have an ID')
        }

        K.EntityFollower.query()
          .count('*')
          .where('followed_id', '=', that.id)
          .andWhere('follower_id', '=', entity.id)
          .then(function (follows) {
            return res(+follows[0].count > 0)
          })
          .catch(rej)
      })
    }
  }
})

module.exports = new K.Entity()
