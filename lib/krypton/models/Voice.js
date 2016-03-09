var ImageUploader = require(path.join(process.cwd(), 'lib', 'image_uploader.js'))

K.Voice = Class(K, 'Voice').inherits(Krypton.Model).includes(ImageUploader)({
  tableName: 'Voices',

  attributes: [
    'id',
    'title',
    'description',
    'latitude',
    'longitude',
    'locationName',
    'ownerId',
    'status',
    'type',
    'twitterSearch',
    'tweetLastFetchAt',
    'rssUrl',
    'rssLastFetchAt',
    'createdAt',
    'updatedAt',
    'deleted'
  ],

  validations: {
    ownerId: ['required'],
    status: ['required'],
    type: ['required'],
    // REFACTOR NOTE: These validations could be much simpler by using Checkit built-in functions.
    title: [
      'required',
      {
        rule: function (val) {
          if (val && val.length > 65) {
            throw new Checkit.FieldError('The title must be less than 65 characters.')
          }
        },
        message: 'The title must be less than 65 characters.'
      }
    ],
    description: [
      'required',
      {
        rule : function(val) {
          if (val && val.length > 180) {
            throw new Checkit.FieldError('The description must be less than 180 characters')
          }
        },
        message : 'The description must be less than 180 characters'
      }
    ],
    twitterSearch: [
      {
        rule: function (val) {
          if (val && val.length > 512) {
            throw new Checkit.FieldError('The Tweeter Search String (twitterSearch) must be less than 512 characters.')
          }
        },
        message: 'The Tweeter Search String (twitterSearch) must be less than 512 characters.'
      }
    ],
    rssUrl: [
      {
        rule: function (val) {
          if (val && val.length > 512) {
            throw new Checkit.FieldError('The RSS URL (rssUrl) must be less than 512 characters.')
          }
        },
        message: 'The RSS URL (rssUrl) must be less than 512 characters.'
      }
    ]
  },

  prototype: {
    description: '',

    init: function (config) {
      Krypton.Model.prototype.init.call(this, config)

      // Add image attachment
      this.hasImage({
        propertyName: 'image',
        versions: {
          small : function(readStream) {
            return readStream.pipe(
              sharp()
                .resize(36, 36)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
            )
          },
          card: function(readStream) {
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
          bluredCard: function(readStream) {
            return readStream.pipe(
              sharp()
                .resize(440)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
                .blur(5)
            )
          },
          big: function(readStream) {
            return readStream.pipe(
              sharp()
                .resize(2560,1113)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
                .blur(25)
            )
          }
        },
        bucket: 'crowdvoice.by',
        basePath: '{env}/{modelName}_{id}/{property}_{versionName}.{extension}'
      })
    },

    getPostsCount: function () {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          return rej(new Error('K.Voice doesn\'t have an ID'))
        }

        K.Post.query()
          .count('*')
          .where('voice_id', '=', that.id)
          .then(function (count) {
            return res(+count[0].count)
          })
          .catch(rej)
      })
    },

    isFollowedBy: function (entity) {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          return rej(new Error('K.Voice doesn\'t have an ID'))
        }

        K.VoiceFollower.query()
          .count('*')
          .where('voice_id', '=', that.id)
          .andWhere('entity_id', '=', entity.id)
          .then(function (follows) {
            return res(+follows[0].count > 0)
          })
          .catch(rej)
      })
    }
  }
})

module.exports = new K.Voice()
