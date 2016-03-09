var TopicsPresenter = Module('TopicsPresenter')({
  build : function build(topics, callback) {
    var response = [];

    async.eachLimit(topics, 1, function(topic, nextTopic) {
      var topicInstance = new Topic(topic);
      topicInstance.id = hashids.encode(topicInstance.id);

      // skip deleted topics
      if (topicInstance.deleted) {
        return nextTopic();
      }

      async.series([
        // Images
        function (next) {
          var images = {};

          for (var version in topicInstance.imageMeta) {
            images[version] = {
              url : topicInstance.image.url(version),
              meta : topicInstance.image.meta(version)
            }
          }

          topicInstance.images = images;

          delete topicInstance.imageBaseUrl;
          delete topicInstance.imageMeta;

          return next();
        },

        // Voices count
        function (next) {
          db('VoiceTopic')
            .where('topic_id', '=', topic.id)
            .asCallback(function (err, rows) {
              if (err) { return next(err); }

              var voiceIds = rows.map(function (record) {
                return record.voice_id;
              });

              db('Voices')
                .count()
                .whereIn('id', voiceIds)
                .andWhere('status', Voice.STATUS_PUBLISHED)
                .asCallback(function (err, rows) {
                  if (err) { return next(err); }

                  topicInstance.voicesCount = rows[0].count;

                  return next();
                });
            });
        }
      ], function (err) {
        if (err) { return nextTopic(err); }

        response.push(topicInstance);

        return nextTopic();
      });
    }, function(err) {
      if (err) {
        return callback(err);
      }

      callback(null, response);
    });
  }
});

module.exports = TopicsPresenter;
