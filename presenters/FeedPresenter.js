'use strict'

var FeedPresenter = Module('FeedPresenter')({
  build: function (feedActions, currentPerson, callback) {
    var result = []

    async.eachLimit(feedActions, 1, function (action, next) {
      var actionInst = new FeedAction(action)

      async.series([
        // feed action ID
        function (next) {
          actionInst.id = hashids.encode(action.id)

          return next()
        },

        // itemType
        function (next) {
          async.series([
            // voice
            function (next) {
              if (action.itemType !== 'voice') {
                return next()
              }

              Voice.findById(action.itemId, function (err, voice) {
                if (err) { return next(err) }

                VoicesPresenter.build(voice, currentPerson, function (err, presentedVoice) {
                  if (err) { return next(err) }

                  actionInst.voice = presentedVoice[0]

                  return next()
                })
              })
            },

            // entity
            function (next) {
              if (action.itemType !== 'entity') {
                return next()
              }

              Entity.findById(action.itemId, function (err, entity) {
                if (err) { return next(err) }

                EntitiesPresenter.build(entity, currentPerson, function (err, presentedEntity) {
                  if (err) { return next(err) }

                  actionInst.entity = presentedEntity[0]

                  return next()
                })
              })
            },

            // message (and the thread that comes with it)
            function (next) {
              if (action.itemType !== 'message') {
                return next()
              }

              K.Message.query()
                .where('id', action.itemId)
                .then(function (result) {
                  return K.MessagesPresenter.build(result, currentPerson);
                })
                .then(function (pres) {
                  actionInst.thread = {
                    messages: pres,
                  }

                  return Promise.resolve()
                })
                .then(next)
                .catch(next)
            },
          ], next)
        },

        // actionDoer
        function (next) {
          Entity.findById(action.who, function (err, entity) {
            if (err) { return next(err) }

            EntitiesPresenter.build(entity, currentPerson, function (err, presentedEntity) {
              if (err) { return next(err) }

              // it is `actionDoer` and not `who` because the frontend already
              // implemented functionality for this using `actionDoer`
              actionInst.actionDoer = presentedEntity[0]

              return next()
            })
          })
        },
      ], function (err) {
        if (err) { return next(err) }

        delete actionInst.itemId
        delete actionInst.who

        result.push(actionInst)

        return next()
      })
    }, function (err) {
      if (err) { return callback(err) }

      return callback(null, result)
    })
  },
})

module.exports = FeedPresenter
