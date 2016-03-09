Admin.FeaturedEntitiesController = Class(Admin, 'FeaturedEntitiesController')({

  presenter: function (featuredEntitiesIdsArray, entityType, currentPerson, callback) {
    var featuredEntitiesResult = []

    async.each(featuredEntitiesIdsArray, function (entityId, next) {
      var toAddToArray = {}

      global['Featured' + inflection.transform(entityType, ['capitalize', 'singularize'])].find({ entity_id: entityId }, function (err, featuredEntity) {
        if (err) { return next(err) }

        toAddToArray = new global['Featured' + inflection.transform(entityType, ['capitalize', 'singularize'])](featuredEntity[0])
        toAddToArray.id = hashids.encode(toAddToArray.id)
        toAddToArray.entityId = hashids.encode(toAddToArray.entityId)

        Entity.findById(featuredEntity[0].entityId, function (err, entity) {
          if (err) { return next(err) }

          EntitiesPresenter.build(entity, currentPerson, function (err, presented) {
            if (err) { return next(err) }

            toAddToArray.entity = presented[0]

            featuredEntitiesResult.push(toAddToArray)

            return next()
          })
        })
      })
    }, function (err) {
      if (err) { return callback(err) }

      var result = featuredEntitiesResult.sort(function (a, b) {
        return a.position - b.position
      })

      return callback(null, result)
    })
  },

  prototype: {

    // GET /admin/featured/:entityType/:entityId*
    // get entity and populate req.featuredEntity and res.locals.featuredEntity
    getEntity: function (req, res, next) {
      Admin.FeaturedEntitiesController.presenter([req.params.entityId], req.params.entityType, req.currentPerson, function (err, presented) {
        if (err) { return next(err) }

        req.featuredEntity = presented[0]
        res.locals.featuredEntity = presented[0]

        return next()
      })
    },

    // GET /admin/featured/:entityType
    // get all featured people and render index view
    index: function (req, res, next) {
      ACL.isAllowed('index', 'admin.featuredEntities', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        global['Featured' + inflection.transform(req.params.entityType, ['capitalize', 'singularize'])].all(function (err, allFeatured) {
          if (err) { return next(err) }

          var ids = allFeatured.map(function (entity) { return entity.entityId })

          Admin.FeaturedEntitiesController.presenter(ids, req.params.entityType, req.currentPerson, function (err, presented) {
            if (err) { return next(err) }

            res.locals.entityType = req.params.entityType;
            res.locals.featuredEntities = presented;

            return res.render('admin/featured/entities/index.html', { layout: 'admin' })
          })
        })
      })
    },

    // GET /admin/featured/:entityType/:entityId
    // render view for viewing a featured person
    show: function (req, res, next) {
      ACL.isAllowed('show', 'admin.featuredEntities', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        return res.render('admin/featured/entities/show.html', { layout: 'admin' })
      })
    },

    // GET /admin/featured/:entityType/new
    // render view for new entity
    new: function (req, res, next) {
      ACL.isAllowed('new', 'admin.featuredEntities', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        return res.render('admin/featured/entities/new.html', { layout: 'admin' })
      })
    },

    // POST /admin/featured/:entityType/new
    // create new featured entity from input
    create: function (req, res, next) {
      /*
       * req.body = {
       *   entityId: Hashids.encode result,
       * }
       */

      ACL.isAllowed('create', 'admin.featuredEntities', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        var featured = new global['Featured' + inflection.transform(req.params.entityType, ['capitalize', 'singularize'])]({
          entityId: hashids.decode(req.body.entityId)[0],
          position: 0,
        })

        featured.save(function (err) {
          if (err) {
            res.locals.errors = err
            req.errors = err
            logger.info(err)
            logger.info(err.stack)
            return res.render('admin/featured/entities/new.html', { layout: 'admin' })
          }

          req.flash('success', 'Featured ' + inflection.singularize(req.params.entityType) + ' created')
          return res.redirect('/admin/featured/' + req.params.entityType)
        })
      })
    },

    // GET /admin/featured/:entityType/:entityId/edit
    // 404
    edit: function (req, res, next) {
      return next(new NotFoundError())
    },

    // PUT /admin/featured/:entityType/:entityId/edit
    // 404
    update: function (req, res, next) {
      return next(new NotFoundError())
    },

    // DELETE /admin/featured/:entityType/:entityId
    // delete req.featuredEntity entity
    destroy: function (req, res, next) {
      /*
       * req.body = {}
       */

      ACL.isAllowed('destroy', 'admin.featuredEntities', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        global['Featured' + inflection.transform(req.params.entityType, ['capitalize', 'singularize'])].find({ entity_id: hashids.decode(req.params.entityId)[0] }, function (err, entity) {
          var featured = new global['Featured' + inflection.transform(req.params.entityType, ['capitalize', 'singularize'])](entity[0])

          featured.destroy(function (err) {
            if (err) {
              res.locals.errors = err
              req.errors = err
              logger.info(err)
              logger.info(err.stack)
              return res.render('admin/featured/entities/index.html', { layout: 'admin' })
            }
            console.log('xxx');
            console.log(req.params.entityType);
            req.flash('success', 'Featured ' + inflection.singularize(req.params.entityType) + ' removed')
            return res.redirect('/admin/featured/' + req.params.entityType)
          })
        })
      })
    },

    // POST /admin/featured/:entityType/updatePositions
    // update the positions of all the entities with input
    updatePositions: function (req, res, next) {
      /*
       * req.body = {
       *   entityIds: [
       *     Hashids.encode result,
       *     Hashids.encode result,
       *     ...
       *   ]
       * }
       */

      ACL.isAllowed('updatePositions', 'admin.featuredEntities', req.role, { currentPerson: req.currentPerson }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized. Must be Admin.'))
        }

        var realIds = req.body.entityIds.map(function (id) {
          return hashids.decode(id)[0]
        })

        db('Featured' + inflection.transform(req.params.entityType, ['capitalize', 'pluralize']))
          .whereIn('entity_id', realIds)
          .asCallback(function (err, result) {
            if (err) { return next(err) }

            var featuredEntities = Argon.Storage.Knex.processors[0](result)

            async.each(featuredEntities, function (val, done) {
              var featuredEntity = new global['Featured' + inflection.transform(req.params.entityType, ['capitalize', 'singularize'])](val)
              featuredEntity.position = realIds.indexOf(val.entityId)

              featuredEntity.save(done)
            }, function (err) {
              if (err) { return next(err) }

              return res.json({ status: 'updated positions' })
            })
          })
      })
    },

    searchEntities: function (req, res, next) {
      return SearchController.prototype['search' + inflection.transform(req.params.entityType, ['capitalize', 'pluralize'])](req, res, next)
    },

  },

})

module.exports = new Admin.FeaturedEntitiesController()
