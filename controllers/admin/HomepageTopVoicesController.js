'use strict'

var fs = require('fs'),
  uuid = require('uuid'), // use .v4
  childExec = require('child_process').exec,
  fsExtra = require('fs-extra')

var FfmpegPresets = require(path.join(__dirname, '../../lib/FfmpegPresets.js'))

Admin.HomepageTopVoicessController = Class(Admin, 'HomepageTopVoicesController')({

  prototype: {

    // GET /admin/topVoices
    index: function (req, res, next) {
      ACL.isAllowed('index', 'admin.homepageTopVoices', req.role, {
        currentPerson: req.currentPerson,
      }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new NotFoundError())
        }

        return res.render('admin/topVoices/index.html', { layout: 'admin' })
      })
    },

    show: function (req, res, next) {
      return next(new NotFoundError())
    },

    new: function (req, res, next) {
      return next(new NotFoundError())
    },

    /** POST /admin/topVoices
     *
     * req.body = {
     *   voiceId: Hashids.encode,
     *   sourceText: String,
     *   sourceUrl: String,
     *   description: String (optional),
     * }
     *
     * req.files = {
     *   video: String,
     *   poster: String,
     * }
     */
    create: function (req, res, next) {
      ACL.isAllowed('create', 'admin.homepageTopVoices', req.role, {
        currentPerson: req.currentPerson,
      }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new NotFoundError())
        }

        var topVoice = new HomepageTopVoice({
          voiceId: hashids.decode(req.body.voiceId)[0],
          sourceText: req.body.sourceText,
          sourceUrl: req.body.sourceUrl,
          description: req.body.description || null,
          active: true,
        })

        var versions = [
          'mp4',
          // 'webm',
          'ogv'
        ]

        var videoDir,
          outputBasePath,
          amazonBasePath,
          useAmazon = false,
          relativeBasePath = ''

        async.series([
          // Make all other videos inactive
          function (nextSeries) {
            db('HomepageTopVoices')
              .update({ active: false })
              .asCallback(nextSeries)
          },

          // Figure out videoUuid
          function (nextSeries) {
            var buffer = new Buffer(16)

            uuid.v4(null, buffer, 0)

            topVoice.videoUuid = uuid.unparse(buffer)

            return nextSeries()
          },

          // Figure out base path(s)
          function (nextSeries) {
            videoDir = 'topVoice_' + req.body.voiceId + '_' + topVoice.videoUuid

            outputBasePath = path.join(process.cwd(), 'public/videos/' + videoDir)
            amazonBasePath = CONFIG.environment + '/videos/' + videoDir

            if (CONFIG.environment === 'development') {
              useAmazon = false
              relativeBasePath = 'videos/' + videoDir
              topVoice.videoPath = relativeBasePath + '/video'
              topVoice.posterPath = relativeBasePath + '/poster.' + req.files.poster.extension
            } else {
              useAmazon = true
              relativeBasePath = amazonBasePath
              topVoice.videoPath = relativeBasePath + '/video'
              topVoice.posterPath = relativeBasePath + '/poster.' + req.files.poster.extension
            }

            fs.mkdir(outputBasePath, nextSeries)
          },

          // Let the front end know stuff's happening
          function (nextSeries) {
            res.status(200).json({
              status: 'processing'
            })

            return nextSeries()
          },

          // Process video
          function (nextSeries) {
            var presets = {
              mp4: 'toMp4',
              ogv: 'toOgv',
            }

            async.each(versions, function (version, doneEach) {
              var command = FfmpegPresets[presets[version]]
              command = command.replace(/{input-path}/g, req.files.video.path)
              command = command.replace(/{output-dir}/g, outputBasePath)
              command = command.replace(/{output-file}/g, 'video')

              logger.info('FFmpeg: Started working on ' + version + '...')

              childExec(command, function (err, stdout, stderr) {
                if (err) { return doneEach(err) }

                logger.info('FFmpeg: STDOUT:', stdout)
                logger.info('FFmpeg: STDERR:', stderr)

                return doneEach()
              })
            }, function (err) {
              if (err) { return nextSeries(err) }

              logger.info('FFmpeg: Finished!')

              return nextSeries()
            })
          },

          // Upload video to Amazon
          function (nextSeries) {
            if (!useAmazon) {
              return nextSeries()
            }

            async.each(versions, function (version, doneEach) {
              var contentTypes = {
                'ogv': 'ogg',
                'mp4': 'mp4',
                // 'webm': 'webm',
              }

              var amazonParams = {
                Bucket: 'crowdvoice.by',
                ACL: 'public-read',
                Key: relativeBasePath + '/video.' + version,
                Body: fs.createReadStream(path.join(outputBasePath, 'video.' + version)),
                ContentType: 'video/' + contentTypes[version],
              }

              amazonS3.upload(amazonParams, doneEach)
            }, nextSeries)
          },

          // Move image (development)
          function (nextSeries) {
            if (useAmazon) {
              return nextSeries()
            }

            fsExtra.move(req.files.poster.path, path.join(outputBasePath, 'poster.' + req.files.poster.extension), nextSeries)
          },

          // Upload image to Amazon (not development)
          function (nextSeries) {
            if (!useAmazon) {
              return nextSeries()
            }

            var amazonParams = {
              Bucket: 'crowdvoice.by',
              ACL: 'public-read',
              Key: topVoice.posterPath,
              Body: fs.createReadStream(req.files.poster.path),
              ContentType: req.files.poster.mimetype,
            }

            amazonS3.upload(amazonParams, nextSeries)
          },

          // Delete stuff in local (after uploading to Amazon)
          function (nextSeries) {
            if (!useAmazon) {
              return nextSeries()
            }

            fsExtra.remove(outputBasePath, nextSeries)
          },

          // Populate and save records
          function (nextSeries) {
            topVoice.save(nextSeries)
          },
        ], function (err) {
          if (err) {
            logger.error(err)
            logger.error(err.stack)
          }
        })
      })
    },

    edit: function (req, res, next) {
      return next(new NotFoundError())
    },

    // PUT /admin/topVoices/:voiceId
    update: function (req, res, next) {
      return next(new NotFoundError())

      ACL.isAllowed('update', 'admin.homepageTopVoices', req.role, {
        currentPerson: req.currentPerson,
      }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new NotFoundError())
        }
      })
    },

    // DELETE /admin/topVoices/:voiceId
    destroy: function (req, res, next) {
      return next(new NotFoundError())

      ACL.isAllowed('destroy', 'admin.homepageTopVoices', req.role, {
        currentPerson: req.currentPerson,
      }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new NotFoundError())
        }
      })
    },

  },

})

module.exports = new Admin.HomepageTopVoicesController()
