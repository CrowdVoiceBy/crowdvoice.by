'use strict';

var sharp = require('sharp');
var http = require('http');
var https = require('https');
var fsextra = require('fs-extra');

// Common variables
var env = process.env['NODE_ENV'] || 'development';

var ImageUploader = Module('ImageUploader')({
  prototype: {
    hasImage: function (config) {
      var model = this,
          property = config.propertyName,
          modelName = model.constructor.className.toLowerCase();

      var versions = {
        original: function (readStream) {
          return readStream;
        }
      };
      Object.keys(config.versions).forEach(function (version) {
        versions[version] = config.versions[version];
      });

      var imageObject = {
        url: function (versionName) {
          if (!model[property + 'BaseUrl']) {
            return null;
          }

          var url;
          if (CONFIG.environment === 'development') {
            url = '/uploads/' + model[property + 'BaseUrl'].
              replace(/{versionName}/g, versionName);
          } else {
            url ='https://s3.amazonaws.com/crowdvoice.by/' + model[property + 'BaseUrl'].
              replace(/{versionName}/g, versionName);
          }

          return url;
        },
        meta: function (versionName) {
          try {
            return model[property + 'Meta'][versionName]
          } catch (e) {
            return {};
          }
        },
        processVersions: function processVersions (done) {
          var url;

          if (!model[property].url('original')) {
            return done();
          }

          if (CONFIG.environment === 'development') {
            url = path.join(process.cwd(), '/public' + model[property].url('original'));
          } else {
            url = model[property].url('original');
          }
          model.uploadImage(property, url, done);
        },
        exists: function (versionName) {
          var meta;
          try {
            meta = model[property + 'Meta'] || {}
          } catch (e) {
            meta = {};
          }

          return meta[versionName] ? true : false;
        },
        versions: versions,
        basePath: config.basePath
      };

      Object.defineProperty(model, property, {
        enumerable: false,
        get: function () {
          return imageObject;
        }
      });
    },

    uploadImage : function uploadImage (property, image, done) {
      if (image.length <= 0) {
        return done();
      }

      var model = this,
          versions = model[property].versions,
          modelName = model.constructor.className.toLowerCase(),
          s3BasePath = model[property].basePath,
          baseUrl = '',
          imagesMetadata = {};

      // For each version, upload an image.
      async.each(Object.keys(versions), function (versionName, done) {
        var uploadParams = {
          Bucket: 'crowdvoice.by',
          ACL: 'public-read',
        };

        // GET IMAGE PATH

        // Build read stream from file system or from a url.
        if (image.match(/^\//)) {
          sharp(image).metadata(function (err, meta) {
            if (err) {
              logger.error(err, image);
              return done(err);
            }
            upload(fs.createReadStream(image), {
              extension: meta.format
            });
          });
        } else if (image.match(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/) ) {
          var request = http;
          if (image.match('https')) {
            request = https;
          }
          request.get(image, function (res) {
            var extension = 'png';

            if (res.headers['content-type']) {
              extension = res.headers['content-type'].replace(/image\//, '');
            }

            upload(res, {
              extension: extension
            });
          });
        }

        // Upload image from a readStream
        var upload = function (readStream, imageInfo) {
          var transform = versions[versionName];

          // Set key
          baseUrl = s3BasePath.
            replace(/{env}/g, env).
            replace(/{modelName}/g, modelName).
            replace(/{id}/g, hashids.encode(model.id)).
            replace(/{property}/g, property).
            replace(/{extension}/g, imageInfo.extension);

          uploadParams.Key = baseUrl.
            replace(/{versionName}/g, versionName);

          // Set extension
          uploadParams.ContentType = 'image/' + imageInfo.extension;

          // PROCESS IMAGE
          var calculator = sharp().metadata(function (err, metadata) {
            imagesMetadata[versionName] = metadata;
          });

          if (typeof(transform) === 'function') {
            var transformStream = transform(readStream).pipe(calculator);
            uploadParams.Body = transformStream;
          } else {
            done(new Error('Version is not a transform function'));
          }

          // UPLOAD/SAVE IMAGE

          if (CONFIG.environment === 'development') {
            var file = path.join(process.cwd(), '/public/uploads', baseUrl.replace(/{versionName}/g, versionName));

            fsextra.ensureFileSync(file);

            var saveToFile = sharp().toFile(file, function (err, info) {
              return done(err);
            });

            transformStream.pipe(saveToFile);
          } else {
            amazonS3.upload(uploadParams, function (err) {
              done(err);
            });
          }
        };
      }, function(err) {

        if (err) {
          logger.info(err);
        }

        // After all images have been uploaded, set the property of the model
        model[property + 'BaseUrl'] = baseUrl;
        model[property + 'Meta'] = imagesMetadata;

        for (var version in model[property + 'Meta']) {
          delete model[property + 'Meta'][version].icc;
          delete model[property + 'Meta'][version].exif;
        }

        done(err);
      });
    },
  }
});

module.exports = ImageUploader;
