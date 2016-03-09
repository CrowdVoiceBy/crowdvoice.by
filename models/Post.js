require(path.join(process.cwd(), 'lib', 'image_uploader.js'));
var url = require('url');
var favicon = require('find-favicon');
var crypto = require('crypto');
var fsextra = require('fs-extra');
var http = require('http');
var https = require('https');
var sanitize = require("sanitize-html");
var sanitizerOptions = {
  allowedTags : [],
  allowedAttributes : []
}

var Post = Class('Post').inherits(Argon.KnexModel).includes(ImageUploader)({

  // Source services:
  SOURCE_SERVICE_RAW:     'raw',
  SOURCE_SERVICE_LINK:    'link',
  SOURCE_SERVICE_VIMEO:   'vimeo',
  SOURCE_SERVICE_YOUTUBE: 'youtube',
  SOURCE_SERVICE_YFROG:   'yfrog',
  SOURCE_SERVICE_TWITPIC: 'twitpic',
  SOURCE_SERVICE_FLICKR:  'flickr',
  SOURCE_SERVICE_LOCAL:   'local',

  // Source types:
  SOURCE_TYPE_IMAGE:      'image',
  SOURCE_TYPE_VIDEO:      'video',
  SOURCE_TYPE_LINK:       'link',
  SOURCE_TYPE_TEXT:       'text',
  SOURCE_TYPE_TWEET:      'tweet',

  validations : {
    ownerId       : ['required'],
    voiceId       : ['required'],
    sourceType    : ['required'],
    sourceUrl     : [
      {
        rule: function (val) {
          if (this.target.sourceType !== Post.SOURCE_TYPE_TEXT && !val) {
            throw new Checkit.FieldError('sourceService is required unless sourceType === "text"');
          }
        },
        message: 'sourceService is required unless sourceType === "text"'
      }
    ],
    sourceService : ['required'],
    publishedAt   : ['required'],
    title         : ['required', 'maxLength:65'],
    description   : [
      'required',
      {
        rule: function (val) {
          if (this.target.sourceType !== Post.SOURCE_TYPE_TEXT && val.length > 180) {
            throw new Checkit.FieldError('The description must be less than 180 characters.');
          }
        },
        message: 'The description must be less than 180 characters.'
      }
    ],
  },

  storage : (new Argon.Storage.Knex({
    tableName : 'Posts',
    queries : {
      whereIn : function(requestObj, callback) {
        db(requestObj.model.storage.tableName).whereIn(requestObj.columnName, requestObj.array).asCallback(callback);
      }
    },

    whereIn : function whereIn(requestObj, callback) {
      // var data;
      var storage = this;

      for (i = 0; i < storage.preprocessors.length; i++) {
        requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
      }

      this.queries.whereIn(requestObj, function(err, data) {
        for (i = 0; i < storage.processors.length; i++) {
          data = storage.processors[i](data, requestObj);
        }

        return callback(err, data);
      });
    }
  })),

  findByVoiceId : function findByVoiceId(voiceId, callback) {
    var Model, request;

    Model = this;

    request = {
      action : 'findByVoiceId',
      model : Model,
      params : {
        'voice_id' : voiceId
      }
    };

    this.dispatch('beforeFindByVoiceId');

    this.storage.findById(request, function(err, data) {
      callback(err, data);
      Model.dispatch('afterFindByVoiceId');
    });
  },

  whereIn : function WhereIn(columnName, array, callback) {
    var Model, request;

    Model = this;

    request = {
      action : 'whereIn',
      model : Model,
      columnName : columnName,
      array : array
    };

    this.dispatch('beforeWhereIn');

    this.storage.whereIn(request, function(err, data) {
      callback(err, data);
      Model.dispatch('afterWhereIn');
    });

    return this;
  },

  buildFromTweet : function buildFromTweet(tweet) {
    var post = new Post();

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

  prototype : {
    id            : null,
    ownerId       : null,
    voiceId       : null,
    approved      : false,
    imageBaseUrl  : null,
    imageMeta     : {},
    faviconPath   : null,
    sourceService : null,
    sourceType    : null,
    sourceUrl     : null,
    sourceDomain  : null,
    title         : null,
    description   : null,
    publishedAt   : null,
    createdAt     : null,
    updatedAt     : null,
    extras        : {},

    init : function init(config) {
      Argon.KnexModel.prototype.init.call(this, config);

      var model = this;

      this.constructor.storage.preprocessors.push(function(data) {
        var sanitizedData, property;

        sanitizedData = {};

        for (property in data) {
          if (data.hasOwnProperty(property)) {
            if (property === 'title' || property === 'description') {
              sanitizedData[property] = sanitize(data[property], sanitizerOptions);
            } else {
              sanitizedData[property] = data[property];
            }
          }
        }

        return sanitizedData;
      });

      // Ensure publishedAt is present to prevent a validation error
      this.bind('beforeValidate', function() {
        if (!model.publishedAt) {
          model.publishedAt =  new Date();
        }
      });

      // Set publishedAt to be the same as createdAt on create if not present
      this.bind('beforeCreate', function() {
        if (!model.publishedAt) {
          model.publishedAt =  model.createdAt;
        } else {
          model.publishedAt = new Date(model.publishedAt);
        }

        if (model.sourceUrl) {
          var sourceURL = url.parse(model.sourceUrl);

          model.sourceDomain = sourceURL.protocol + '//' + sourceURL.hostname;
        }
      });

      this.bind('afterSave', function () {
        if (!model.approved) {
          return;
        }

        Voice.find({
          id: model.voiceId
        }, function (err, voice) {
          if (err) {
            logger.error(err);
            logger.error(err.stack);
          }

          var newerVoice = new Voice(voice[0]);
          return newerVoice.save(function (err) {
            if (err) {
              logger.error(err);
              logger.error(err.stack);
            }
          });
        });
      });

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
              );
            } else {
              return gm(readStream)
                .resize(85)
                .stream();
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
              );
            } else {
              return gm(readStream)
                .resize(340)
                .stream();
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
            );
          }
        },
        bucket: 'crowdvoice.by',
        basePath: '{env}/{modelName}_{id}/{property}_{versionName}.{extension}'
      });
    },

    save : function save(callback) {
      var model, request;

      var date = new Date(Date.now());

      model = this;

      this.constructor.dispatch('beforeSave', {
        data : {
          model : this
        }
      });

      this.dispatch('beforeSave');

      this.isValid(function (isValid) {
        if (isValid) {

          model.updatedAt = model.updatedAt || date;

          if (model.hasOwnProperty('id') && model.id !== '') {
            model.dispatch('beforeUpdate');

            request = {
              action : 'update',
              data : model,
              model : model.constructor
            };

            model.constructor.storage.update(request, function updateCallback(err, data) {
              model.constructor.dispatch('afterSave', {
                data : {
                  model : model
                }
              });

              model.dispatch('afterSave');

              model.dispatch('afterUpdate');

              callback(err, data);
            });
          } else {

            model.createdAt = model.createdAt || date;

            model.dispatch('beforeCreate');

            request = {
              action : 'create',
              data : model,
              model : model.constructor
            }

            var result = null;


            async.series([function(next) {
              model.constructor.storage.create(request, function createCallback(err, data) {
                if (data) {
                  model.setProperty('id', data[0]);
                }

                model.constructor.dispatch('afterSave', {
                  data : {
                    model : model
                  }
                });

                model.dispatch('afterSave');

                model.dispatch('afterCreate');

                result = data

                next(err);
              });
            }, function(next) {
              if (!model.sourceDomain) {
                return next();
              }

              favicon(model.sourceDomain, function(err, faviconURL) {
                if (err || !faviconURL) {
                  return next();
                }

                if (!url.parse(faviconURL.url).host) {
                  return next();
                }

                var faviconHash = crypto.createHash('md5')
                  .update(faviconURL.url)
                  .digest('hex');

                var req = http;

                if (faviconURL.url.match('https')) {
                  req = https;
                }

                req.get(faviconURL.url, function(res) {
                  var extension;

                  // Sometimes they may send an image but give no content-type header,
                  // we can't trust that it's an image if the content-type doesn't exist.
                  if (!res.headers['content-type']) {
                    return next();
                  }

                  if (!res.headers['content-type'].match('image')) {
                    return next();
                  }

                  if (res.headers['content-length'] === '0') {
                    return next();
                  }

                  if (res.headers['content-type']) {
                    extension = res.headers['content-type'].replace(/image\//, '');
                  }

                  if (CONFIG.environment === 'development') {

                    var file = path.join(process.cwd(), '/public/uploads/favicons/', faviconHash);

                    model.faviconPath = faviconHash;

                    if (extension) {
                      model.faviconPath = model.faviconPath + '.' + extension;
                      file = file + '.' + extension;
                    }

                    fsextra.ensureFileSync(file);

                    res.pipe(fs.createWriteStream(file));

                    return next();
                  } else {
                    var uploadParams = {
                      Bucket: 'crowdvoice.by',
                      ACL: 'public-read',
                      Key : CONFIG.environment + '/favicons/' + faviconHash
                    }

                    model.faviconPath = faviconHash;

                    if (extension) {
                      model.faviconPath = model.faviconPath + '.' + extension;
                      uploadParams.Key = uploadParams.Key + '.' + extension;
                    }

                    uploadParams.ContentType = res.headers['content-type'];

                    uploadParams.Body = res;

                    amazonS3.upload(uploadParams, function(err) {
                      next();
                    });
                  }
                });


              });
            }, function(next) {
              if (!model.sourceDomain) {
                return next();
              }

              model.save(next);
            }], function(err) {
              if (err) {
                callback(err);
              }

              callback(null, result);
            });
          }
        } else {
          callback(model.errors);
        }
      });
    }
  }
});

module.exports = Post;
