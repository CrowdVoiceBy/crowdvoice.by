var ImageUploader = require(path.join(process.cwd(), 'lib', 'image_uploader.js'))

var url = require('url'),
  favicon = require('find-favicon'),
  crypto = require('crypto'),
  fsextra = require('fs-extra'),
  http = require('http'),
  https = require('https')

K.Post = Class(K, 'Post').inherits(Krypton.Model).includes(ImageUploader)({
  tableName: 'Posts',

  attributes: [
    'id',
    'title',
    'description',
    'ownerId',
    'voiceId',
    'approved',
    'imageBaseUrl',
    'imageMeta',
    'sourceService',
    'sourceType',
    'sourceUrl',
    'publishedAt',
    'createdAt',
    'updatedAt',
    'sourceDomain',
    'faviconPath',
    'extras'
  ],

  validations: {
    ownerId: ['required'],
    voiceId: ['required'],
    sourceType: ['required'],
    sourceUrl: [
      {
        rule: function (val) {
          if (this.target.sourceType !== K.Post.SOURCE_TYPE_TEXT && !val) {
            throw new Checkit.FieldError('sourceService is required unless sourceType === "text"')
          }
        },
        message: 'sourceService is required unless sourceType === "text"'
      }
    ],
    sourceService: ['required'],
    publishedAt: ['required'],
    title: ['required', 'maxLength:65'],
    description: [
      'required',
      {
        rule: function (val) {
          if (this.target.sourceType !== K.Post.SOURCE_TYPE_TEXT && val.length > 180) {
            throw new Checkit.FieldError('The description must be less than 180 characters.')
          }
        },
        message: 'The description must be less than 180 characters.'
      }
    ]
  },

  SOURCE_SERVICE_RAW: 'raw',
  SOURCE_SERVICE_LINK: 'link',
  SOURCE_SERVICE_VIMEO: 'vimeo',
  SOURCE_SERVICE_YOUTUBE: 'youtube',
  SOURCE_SERVICE_YFROG: 'yfrog',
  SOURCE_SERVICE_TWITPIC: 'twitpic',
  SOURCE_SERVICE_FLICKR: 'flickr',
  SOURCE_SERVICE_LOCAL: 'local',

  SOURCE_TYPE_IMAGE: 'image',
  SOURCE_TYPE_VIDEO: 'video',
  SOURCE_TYPE_LINK: 'link',
  SOURCE_TYPE_TEXT: 'text',
  SOURCE_TYPE_TWEET: 'tweet',

  buildFromTweet : function buildFromTweet(tweet) {
    var post = new K.Post();

    post.sourceType = this.SOURCE_TYPE_TWEET;
    post.sourceService = this.SOURCE_SERVICE_LOCAL;
    post.sourceUrl = 'http://twitter.com/statuses/' + tweet.id_str;
    post.sourceDomain = 'twitter.com';
    post.title = tweet.user.name;
    post.description = tweet.text;

    post.extras = {
      profileImageURL : tweet.user.profile_image_url_https,
      id_str: tweet.id_str
    };

    return post;
  },

  prototype: {
    approved: false,
    imageMeta: {},
    extras : {},

    init: function (config) {
      Krypton.Model.prototype.init.call(this, config)

      var model = this

      // Ensure publishedAt is present to prevent a validation error
      this.on('beforeValidation', function (callback) {
        if (!model.publishedAt) {
          model.publishedAt = new Date()
        } else {
          model.publishedAt = new Date(model.publishedAt)
        }

        return callback()
      })

      // Parse source URL if present
      this.on('beforeCreate', function (callback) {
        if (model.sourceUrl) {
          var sourceURL = url.parse(model.sourceUrl)

          model.sourceDomain = sourceURL.protocol + '//' + sourceURL.hostname
        }

        return callback()
      })

      // Favicon
      this.on('beforeCreate', function (callback) {
        if (!model.sourceDomain) {
          return callback()
        }

        var prom = new Promise(function (resolve, rej) {
          favicon(model.sourceDomain, function(err, faviconURL) {
            if (err || !faviconURL) {
              return resolve()
            }

            if (!url.parse(faviconURL.url).host) {
              return resolve()
            }

            var faviconHash = crypto.createHash('md5')
              .update(faviconURL.url)
              .digest('hex')

            var req = http

            if (faviconURL.url.match('https')) {
              req = https
            }

            req.get(faviconURL.url, function(res) {
              var extension

              // Sometimes they may send an image but give no content-type header,
              // we can't trust that it's an image if the content-type doesn't exist.
              if (!res.headers['content-type']) {
                return resolve()
              }

              if (!res.headers['content-type'].match('image')) {
                return resolve()
              }

              if (res.headers['content-type']) {
                extension = res.headers['content-type'].replace(/image\//, '')
              }

              if (CONFIG.environment === 'development') {
                var file = path.join(process.cwd(), '/public/uploads/favicons/', faviconHash)

                model.faviconPath = faviconHash

                if (extension) {
                  model.faviconPath = model.faviconPath + '.' + extension
                  file = file + '.' + extension
                }

                fsextra.ensureFileSync(file)

                res.pipe(fs.createWriteStream(file))

                return resolve()
              } else {
                var uploadParams = {
                  Bucket: 'crowdvoice.by',
                  ACL: 'public-read',
                  Key : CONFIG.environment + '/favicons/' + faviconHash
                }

                model.faviconPath = faviconHash

                if (extension) {
                  model.faviconPath = model.faviconPath + '.' + extension
                  uploadParams.Key = uploadParams.Key + '.' + extension
                }

                uploadParams.ContentType = res.headers['content-type']

                uploadParams.Body = res

                amazonS3.upload(uploadParams, function(err) {
                  return resolve()
                })
              }
            })
          })
        })

        prom
          .then(function () {
            return callback()
          })
          .catch(callback)
      })

      this.on('afterSave', function (callback) {
        if (!model.approved) {
          return callback()
        }

        K.Voice.query()
          .where('id', '=', model.voiceId)
          .then(function (voice) {
            return voice[0].save()
          })
          .then(function () {
            return callback()
          })
          .catch(callback)
      })

      // Add image attachment
      this.hasImage({
        propertyName: 'image',
        versions: {
          small: function(readStream) {
            if (!useGM) {
              return readStream.pipe(
                sharp()
                  .resize(85)
                  .embed()
                  .flatten()
                  .background('#FFFFFF')
                  .quality(80)
              )
            } else {
              return gm(readStream)
                .resize(85)
                .stream()
            }
          },
          medium: function(readStream) {
            if (!useGM) {
              return readStream.pipe(
                sharp()
                  .resize(340)
                  .embed()
                  .flatten()
                  .background('#FFFFFF')
                  .quality(80)
              )
            } else {
              return gm(readStream)
                .resize(340)
                .stream()
            }
          },
          big: function(readStream) {
            return readStream.pipe(
              sharp()
                .resize(2560, 1113)
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

    getSavesCount: function () {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          return rej(new Error('K.Post doesn\'t have an ID'))
        }

        K.SavedPost.query()
          .count('*')
          .where('post_id', '=', that.id)
          .then(function (saves) {
            return res(+saves[0].count)
          })
          .catch(rej)
      })
    },

    getVotesCount: function () {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          return rej(new Error('K.Post doesn\'t have an ID'))
        }

        K.Vote.query()
          .count('*')
          .where('post_id', '=', that.id)
          .then(function (votes) {
            return res(+votes[0].count)
          })
          .catch(rej)
      })
    },

    isVotedBy: function (entity) {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          return rej(new Error('K.Post doesn\'t have an ID'))
        }

        K.Vote.query()
          .count('*')
          .where('post_id', '=', that.id)
          .andWhere('entity_id', '=', entity.id)
          .then(function (votes) {
            return res(+votes[0].count > 0)
          })
          .catch(rej)
      })
    },

    isSavedBy: function (entity) {
      var that = this

      return new Promise(function (res, rej) {
        if (!that.id) {
          return rej(new Error('K.Post doesn\'t have an ID'))
        }

        K.SavedPost.query()
          .count('*')
          .where('post_id', '=', that.id)
          .andWhere('entity_id', '=', entity.id)
          .then(function (saves) {
            return res(+saves[0].count > 0)
          })
          .catch(rej)
      })
    }
  }
})

module.exports = new K.Post()
