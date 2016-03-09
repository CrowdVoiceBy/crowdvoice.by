Admin.FeaturedVoicesController = Class(Admin, 'FeaturedVoicesController')({

  presenter: function (featuredVoicesIdsArray, currentPerson, callback) {
    var featuredVoicesResult = []

    async.each(featuredVoicesIdsArray, function (voiceId, next) {
      var toAddToArray = {}

      FeaturedVoice.find({ voice_id: voiceId }, function (err, featuredVoice) {
        if (err) { return next(err) }

        toAddToArray = new FeaturedVoice(featuredVoice[0])
        toAddToArray.id = hashids.encode(toAddToArray.id)
        toAddToArray.voiceId = hashids.encode(toAddToArray.voiceId)

        Voice.findById(featuredVoice[0].voiceId, function (err, voice) {
          if (err) { return next(err) }

          VoicesPresenter.build(voice, currentPerson, function (err, presented) {
            if (err) { return next(err) }

            toAddToArray.voice = presented[0]

            featuredVoicesResult.push(toAddToArray)

            return next()
          })
        })
      })
    }, function (err) {
      if (err) { return callback(err) }

      var result = featuredVoicesResult.sort(function (a, b) {
        return a.position - b.position
      })

      return callback(null, result)
    })
  },

  prototype: {

    // GET /admin/featured/voices/:voiceId*
    // get voice and populate req.featuredVoice and res.locals.featuredVoice
    getVoice: function (req, res, next) {
      Admin.FeaturedVoicesController.presenter([req.params.voiceId], req.currentPerson, function (err, presented) {
        if (err) { return next(err) }

        req.featuredVoice = presented[0]
        res.locals.featuredVoice = presented[0]

        return next()
      })
    },

    // GET /admin/featured/voices
    // get all featured people and render index view
    index: function (req, res, next) {
      ACL.isAllowed('index', 'admin.featuredVoices', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        FeaturedVoice.all(function (err, result) {
          if (err) { return next(err) }

          var ids = result.map(function (voice) { return voice.voiceId })

          Admin.FeaturedVoicesController.presenter(ids, req.currentPerson, function (err, presented) {
            if (err) { return next(err) }

            res.locals.featuredVoices = presented

            return res.render('admin/featured/voices/index.html', { layout: 'admin' })
          })
        })
      })
    },

    // GET /admin/featured/voices/:voiceId
    // render view for viewing a featured person
    show: function (req, res, next) {
      ACL.isAllowed('show', 'admin.featuredVoices', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        return res.render('admin/featured/voices/show.html', { layout: 'admin' })
      })
    },

    // GET /admin/featured/voices/new
    // render view for new voice
    new: function (req, res, next) {
      ACL.isAllowed('new', 'admin.featuredVoices', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        return res.render('admin/featured/voices/new.html', { layout: 'admin' })
      })
    },

    // POST /admin/featured/voices/new
    // create new featured voice from input
    create: function (req, res, next) {
      /*
       * req.body = {
       *   voiceId: Hashids.encode result,
       * }
       */

      ACL.isAllowed('create', 'admin.featuredVoices', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        var featured = new FeaturedVoice({
          voiceId: hashids.decode(req.body.voiceId)[0],
          position: 0,
        })

        featured.save(function (err) {
          if (err) {
            res.locals.errors = err
            req.errors = err
            logger.info(err)
            logger.info(err.stack)
            return res.render('admin/featured/voices/new.html', { layout: 'admin' })
          }

          req.flash('success', 'Featured voice created')
          return res.redirect('/admin/featured/voices')
        })
      })
    },

    // GET /admin/featured/voices/:voiceId/edit
    // 404
    edit: function (req, res, next) {
      return next(new NotFoundError())
    },

    // PUT /admin/featured/voices/:voiceId/edit
    // 404
    update: function (req, res, next) {
      return next(new NotFoundError())
    },

    // DELETE /admin/featured/voices/:voiceId
    // delete req.featuredVoice voice
    destroy: function (req, res, next) {
      /*
       * req.body = {}
       */

      ACL.isAllowed('destroy', 'admin.featuredVoices', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        FeaturedVoice.find({ voice_id: hashids.decode(req.params.voiceId)[0] }, function (err, voice) {
          var featured = new FeaturedVoice(voice[0])

          featured.destroy(function (err) {
            if (err) {
              res.locals.errors = err
              req.errors = err
              logger.info(err)
              logger.info(err.stack)
              return res.render('admin/featured/voices/index.html', { layout: 'admin' })
            }

            req.flash('success', 'Featured voice deleted')
            return res.redirect('/admin/featured/voices')
          })
        })
      })
    },

    // POST /admin/featured/voices/updatePositions
    // update the positions of all the voices with input
    updatePositions: function (req, res, next) {
      /*
       * req.body = {
       *   voiceIds: [
       *     Hashids.encode result,
       *     Hashids.encode result,
       *     ...
       *   ]
       * }
       */

      ACL.isAllowed('updatePositions', 'admin.featuredVoices', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        var realIds = req.body.voiceIds.map(function (id) {
          return hashids.decode(id)[0]
        })

        db('FeaturedVoices')
          .whereIn('voice_id', realIds)
          .asCallback(function (err, result) {
            if (err) { return next(err) }

            var featuredVoices = Argon.Storage.Knex.processors[0](result)

            async.each(featuredVoices, function (val, next) {
              var featuredVoice = new FeaturedVoice(val)
              featuredVoice.position = realIds.indexOf(val.voiceId)

              featuredVoice.save(next)
            }, function (err) {
              if (err) { return next(err) }

              return res.json({ status: 'updated positions' })
            })
          })
      })
    },

  },

})

module.exports = new Admin.FeaturedVoicesController()
