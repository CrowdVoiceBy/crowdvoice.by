var ImageUploader = require(__dirname + '/../lib/image_uploader.js');

var Topic = Class('Topic').inherits(Argon.KnexModel).includes(ImageUploader)({

  validations : {
    name : ['required'],
    slug : ['required']
  },

  storage : (new Argon.Storage.Knex({
    tableName : 'Topics',
    queries : {
      whereIn : function(requestObj, callback) {
        db(requestObj.model.storage.tableName).whereIn(requestObj.columnName, requestObj.array).asCallback(callback)
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

  findBySlug : function findBySlug(slugString, done) {
    Topic.find({ slug : slugString }, function(err, result) {
      if (err) {
        return done(err);
      }

      if (result.length === 0) {
        return next(new NotFoundError('Topic Not Found'));
      }

      return done(null, result[0]);
    });
  },

  prototype : {
    name : null,
    slug : null,

    init : function init(config) {
      Argon.KnexModel.prototype.init.call(this, config);

      this.hasImage({
        propertyName: 'image',
        versions : {
          icon: function(readStream) {
            return readStream.pipe(
              sharp()
                .resize(192, 192)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .embed()
                .png()
                .quality(100)
            );
          }
        },
        bucket: 'crowdvoice.by',
        basePath: '{env}/{modelName}_{id}/{property}_{versionName}.{extension}'
      });
    }
  }
});

module.exports = Topic;
