var sanitize = require("sanitize-html");
var sanitizerOptions = {
  allowedTags : [],
  allowedAttributes : []
}

var ImageUploader = require(path.join(process.cwd(), 'lib', 'image_uploader.js'))

var Voice = Class('Voice').inherits(Argon.KnexModel).includes(ImageUploader)({

  STATUS_DRAFT:     'STATUS_DRAFT',
  STATUS_UNLISTED:  'STATUS_UNLISTED',
  STATUS_PUBLISHED: 'STATUS_PUBLISHED',
  STATUS_ARCHIVED:  'STATUS_ARCHIVED',

  TYPE_PUBLIC:      'TYPE_PUBLIC',
  TYPE_CLOSED:      'TYPE_CLOSED',

  validations : {
    ownerId : ['required'],
    status : ['required'],
    type : ['required'],
    title : [
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
    description : [
      'required',
      {
        rule : function(val) {
          if (val && val.length > 180) {
            throw new Checkit.FieldError('The description must be less than 180 characters');
          }
        },
        message : 'The description must be less than 180 characters'
      }
    ],
    twitterSearch : [
      {
        rule: function (val) {
          if (val && val.length > 512) {
            throw new Checkit.FieldError('The Tweeter Search String (twitterSearch) must be less than 512 characters.')
          }
        },
        message: 'The Tweeter Search String (twitterSearch) must be less than 512 characters.'
      }
    ],
    rssUrl : [
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

  storage : (new Argon.Storage.Knex({
    tableName : 'Voices',
    queries : {
      whereIn : function(requestObj, callback) {
        db(requestObj.model.storage.tableName).whereIn(requestObj.columnName, requestObj.array).asCallback(callback);
      }
    },
    whereIn : function whereIn(requestObj, callback) {
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

  findByOwnerId : function findByOwnerId (ownerId, callback) {
    var Model, request;

    Model = this;

    request = {
      action : 'findByOwnerId',
      model : Model,
      params : {
        'owner_id' : ownerId
      }
    };

    this.dispatch('beforeFindByOwnerId');

    this.storage.findById(request, function(err, data) {
      callback(err, data);
      Model.dispatch('afterFindByOwnerId');
    });
  },

  filterBy : function filterBy (query, done) {
    var model = this;
    var kxquery = db('Voices');
    var i;

    for (i = 0; i < this.storage.preprocessors.length; i++) {
      query = this.storage.preprocessors[i](query);
    }

    Object.keys(query).forEach(function (key) {
      if (!query[key]) { return; };
      switch (key) {
        case 'topics':
          kxquery.leftJoin('VoiceTopic', 'VoiceTopic.voice_id', 'Voices.id');
          kxquery.leftJoin('Topics', 'VoiceTopic.topic_id', 'Topics.id');
          kxquery.whereIn('Topics.name', query[key]);
          break;
        case 'created_after':
          kxquery.whereRaw("created_at >= '" + moment(new Date(query[key]).toISOString()).format() + "'");
          break;
        case 'created_before':
          kxquery.whereRaw("created_at <= '" + moment(new Date(query[key]).toISOString()).format() + "'");
          break;
        default:
          kxquery.where(key, '=', query[key]);
      }
    });

    kxquery.asCallback(function(err, data) {
      for (i = 0; i < model.storage.processors.length; i++) {
        data = model.storage.processors[i](data);
      }

      return done(err, data);
    });
  },

  findBySlug : function findBySlug (slugString, done) {
    Slug.find(["url = lower(trim( ' ' from ?))", [slugString]], function (err, result) {
      if (err) { done(err); return; }

      if (result.length === 0) { done(new NotFoundError('Voice not found')); }

      var slug = new Slug(result[0]);

      slug.voice(function (err, result) {
        done(err, new Voice(result));
      });
    });
  },

  prototype : {
    id : null,
    title : null,
    description : '',
    latitude : null,
    longitude : null,
    locationName : null,
    ownerId : null,
    status : null,
    type : null,
    twitterSearch : null,
    tweetLastFetchAt : null,
    rssUrl : null,
    rssLastFetchAt : null,
    createdAt : null,
    updatedAt : null,

    init : function (config) {
      var model = this;
      Argon.KnexModel.prototype.init.call(this, config);

      this.constructor.storage.preprocessors.push(function(data) {
        var sanitizedData, property;

        sanitizedData = {};

        for (property in data) {
          if (data.hasOwnProperty(property)) {
            if (property === 'title' || property === 'description' || property === 'location_name' || property === 'twitter_search' || property === 'latitude' || property === 'longitude') {
              sanitizedData[property] = sanitize(data[property], sanitizerOptions);
            } else {
              sanitizedData[property] = data[property];
            }
          }
        }

        return sanitizedData;
      });

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
            );
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
            );
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
            );
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
            );
          }
        },
        bucket: 'crowdvoice.by',
        basePath: '{env}/{modelName}_{id}/{property}_{versionName}.{extension}'
      });
    },

    /**
    Has Many Posts Association
    @method posts <public>
    @property whereClause <Object> {'voice_id' : 1, approved : true}
    @return undefined
    **/
    posts : function posts(whereClause, callback) {
      var model = this;

      if (!model.id) {
        return callback(null, []);
      }

      if (!whereClause) {
        whereClause = {}
      }

      whereClause['voice_id'] = model.id;

      Post.find(whereClause, callback);
    },

    /**
     * Relates topics to this voice
     */
    addTopics : function (topics, done) {
      var voice = this;
      topics.forEach(function (topic) {
        Topic.find({name: topic, deleted: false}, function (err, result) {
          if (err) { done(err); return; }
          if (result.length === 0) { done(new Error('Topic (' + topic + ') not found when adding topics to voice')); return; }

          db('VoiceTopic').insert({
            voice_id: voice.id,
            topic_id: result[0].id
          }).asCallback(function (err, result) {
            done(err);
          });
        });
      });
    },

    getSlug : function () {
      return this.url;
    },

    /* Add slug for a voice.
     * Makes sure there only exist maximum of 3 slugs per voice.
     */
    addSlug : function (slugString, done) {
      if (typeof(slugString) === 'function') {
        done = slugString;
        slugString = this.getSlug();
      }

      var voice = this;
      var slug = new Slug({
        voiceId : voice.id,
        url: slugString
      });
      slug.save(function (err) {
        if (err) { done (err); return; }
        var subquery = db('Slugs');
        subquery.where({voice_id: voice.id});
        subquery.select('id');
        subquery.orderBy('created_at', 'desc');
        subquery.limit(3);

        subquery.asCallback(function () {
          console.log(arguments);
        });

        var query = db('Slugs');
        query.where({voice_id: voice.id});
        query.where('id', 'not in', subquery);
        query.del();
        query.asCallback(done);
      });
    }
  }
});

module.exports = Voice;
