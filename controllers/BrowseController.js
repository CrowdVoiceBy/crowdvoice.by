var BrowseController = Class('BrowseController')({
  prototype: {
    featuredVoices: function (req, res, next) {
      async.waterfall([
        function (callback) {
          FeaturedVoice.all(callback)
        },

        function (allFeaturedVoices, callback) {
          var featuredVoicesIds = allFeaturedVoices.map(function (val) {
            return val.voiceId
          })
          Voice.whereIn('id', featuredVoicesIds, callback)
        },

        function (featuredVoices, callback) {
          callback(null, featuredVoices.filter(function (val) {
            return val.status === Voice.STATUS_PUBLISHED
          }))
        },

        function (publishedFeaturedVoices, callback) {
          VoicesPresenter.build(publishedFeaturedVoices, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            res.locals.featuredVoices = result
            req.featuredVoices = result
            res.render('browse/featured/voices')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    featuredPeople: function (req, res, next) {
      async.waterfall([
        function (callback) {
          FeaturedPerson.all(callback)
        },

        function (allFeaturedPeople, callback) {
          var featuredPeopleIds = allFeaturedPeople.map(function (val) {
            return val.entityId
          })
          Entity.whereIn('id', featuredPeopleIds, callback)
        },

        function (featuredPeopleEntities, callback) {
          EntitiesPresenter.build(featuredPeopleEntities, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            res.locals.featuredPeople = result
            req.featuredPeople = result
            res.render('browse/featured/people')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    featuredOrganizations: function (req, res, next) {
      async.waterfall([
        function (callback) {
          FeaturedOrganization.all(callback)
        },

        function (allFeaturedOrgs, callback) {
          var featuredOrgsIds = allFeaturedOrgs.map(function (val) {
            return val.entityId
          })
          Entity.whereIn('id', featuredOrgsIds, callback)
        },

        function (featuredOrgsEntities, callback) {
          EntitiesPresenter.build(featuredOrgsEntities, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            res.locals.featuredOrganizations = result
            req.featuredOrganizations = result
            res.render('browse/featured/organizations')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },
  },
})

module.exports = new BrowseController()
