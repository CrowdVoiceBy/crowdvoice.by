var TopicsController = Class('TopicsController')({

  prototype : {

    // GET /topic/:topicSlug/newestVoices
    newestVoices : function (req, res, next) {
      async.waterfall([
        // get our topic, by slug
        function (next) {
          Topic.find({ slug: req.params.topicSlug }, next)
        },

        // find records related to our topic
        function (topic, next) {
          VoiceTopic.find({ topic_id: topic[0].id }, next)
        },

        // get voices by topic
        function (voiceTopic, next) {
          var ids = voiceTopic.map(function (val) {
            return val.voiceId
          })

          db('Voices')
            .whereIn('id', ids)
            .andWhere('status', Voice.STATUS_PUBLISHED)
            .andWhere('deleted', false)
            .orderBy('created_at', 'desc')
            .limit(3)
            .asCallback(function (err, rows) {
              if (err) { return next(err) }

              return next(null, Argon.Storage.Knex.processors[0](rows))
            })
        },
      ], function (err, voices) {
        if (err) { return next(err) }

        VoicesPresenter.build(voices, req.currentPerson, function (err, presented) {
          if (err) { return next(err) }

          return res.json({
            voices: presented,
          })
        })
      })
    },

    people : function (req, res, next) {
      async.waterfall([
        // get our topic, by slug
        function (callback) {
          Topic.find({ slug: req.params.topicSlug }, callback)
        },

        // find records related to our topic
        function (topic, callback) {
          VoiceTopic.find({ topic_id: topic[0].id }, callback)
        },

        // get voices by topic
        function (voiceTopic, callback) {
          var voicesIds = voiceTopic.map(function (val) {
            return val.voiceId
          })
          // Knex queries FTW
          db('Voices')
            .whereIn('id', voicesIds)
            .andWhere('status', Voice.STATUS_PUBLISHED)
            .andWhere('deleted', false)
            .asCallback(callback)
        },

        // get owners of voices
        function (voices, callback) {
          var ownersIds = voices.map(function (val) {
            return val.owner_id
          })
          // Knex queries FTW
          db('Entities')
            .whereIn('id', ownersIds)
            .andWhere('is_anonymous', false)
            .andWhere('type', 'person')
            .andWhere('deleted', false)
            .asCallback(callback)
        },

        function (entities, callback) {
          var processed = Argon.Storage.Knex.processors[0](entities)
          EntitiesPresenter.build(processed, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            req.entities = result
            res.locals.entities = result
            res.render('topics/people')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    organizations : function (req, res, next) {
      async.waterfall([
        // get our topic, by slug
        function (callback) {
          Topic.find({ slug: req.params.topicSlug }, callback)
        },

        // find records related to our topic
        function (topic, callback) {
          VoiceTopic.find({ topic_id: topic[0].id }, callback)
        },

        // get voices by topic
        function (voiceTopic, callback) {
          var voicesIds = voiceTopic.map(function (val) {
            return val.voiceId
          })
          // Knex queries FTW
          db('Voices')
            .whereIn('id', voicesIds)
            .andWhere('status', Voice.STATUS_PUBLISHED)
            .andWhere('deleted', false)
            .asCallback(callback)
        },

        // get owners of voices
        function (voices, callback) {
          var ownersIds = voices.map(function (val) {
            return val.owner_id
          })
          // Knex queries FTW
          db('Entities')
            .whereIn('id', ownersIds)
            .andWhere('is_anonymous', false)
            .andWhere('type', 'organization')
            .andWhere('deleted', false)
            .asCallback(callback)
        },

        function (entities, callback) {
          var processed = Argon.Storage.Knex.processors[0](entities)
          EntitiesPresenter.build(processed, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            req.entities = result
            res.locals.entities = result
            res.render('topics/organizations')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    populateLocals : function (req, res, next) {
      Topic.all(function (err, allTopics) {
        if (err) { return next(err) }

        TopicsPresenter.build(allTopics, function (err, presenterTopics) {
          if (err) { return next(err) }

          req.topics = presenterTopics
          res.locals.topics = presenterTopics
          return next()
        })
      })
    },

    getTopicBySlug : function (req, res, next) {
      var result = {
        currentTopic: null,
        voices: null
      }

      async.waterfall([
        function (callback) {
          Topic.find({ slug: req.params.topicSlug }, callback);
        },

        function (topic, callback) {
          TopicsPresenter.build(topic, callback);
        },

        function (presenterTopic, callback) {
          var topicId = hashids.decode(presenterTopic[0].id)[0];
          result.currentTopic = presenterTopic[0];

          db('VoiceTopic')
            .where({topic_id : topicId})
            .offset(req.query.offset || 0)
            .limit(req.query.limit || 50)
            .orderBy('created_at', 'desc')
            .asCallback(function(err, result) {
              if (err) {
                return callback(err);
              }

              var voicesForTopic = Argon.Storage.Knex.processors[0](result);

              callback(null, voicesForTopic);

            });
        },

        function (voicesForTopic, callback) {
          var voicesIds = voicesForTopic.map(function (val) {
            return val.voiceId;
          });

          db('Voices')
            .whereIn('id', voicesIds)
            .andWhere('status', Voice.STATUS_PUBLISHED)
            .andWhere('deleted', false)
            .asCallback(callback);
        },

        function (voices, callback) {
          var processed = Argon.Storage.Knex.processors[0](voices)
          VoicesPresenter.build(processed, req.currentPerson, callback);
        }
      ], function (err, voices) {
        if (err) { return next(err); }

        result.voices = voices;

        res.format({
          html: function () {
            req.currentTopic = result.currentTopic;
            req.voices = result.voices;
            res.locals.currentTopic = result.currentTopic;
            res.locals.voices = result.voices;
            res.render('topics/show');
          },
          json: function () {
            res.json(result);
          }
        });
      });
    },

    index : function index (req, res, next) {
      Topic.all(function(err, result) {
        if (err) {
          return done(err);
        }

        TopicsPresenter.build(result, function(err, topics) {
          if (err) {
            return done(err);
          }

          res.locals.topics = topics;
          res.format({
            'application/json': function () {
              res.json(res.locals.topics);
            }
          });
        });
      });
    }
  }

});

module.exports = new TopicsController();
