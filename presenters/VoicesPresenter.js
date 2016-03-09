var sanitize = require("sanitize-html");
var EntitiesPresenter = require('./EntitiesPresenter.js');
var TopicsPresenter = require('./TopicsPresenter.js');

var VoicesPresenter = Module('VoicesPresenter')({
  build : function build(voices, currentPerson, callback) {
    var response = [];
    async.eachLimit(voices, 1, function(voice, nextVoice) {
      var voiceInstance = new Voice(voice);
      voiceInstance.id = hashids.encode(voiceInstance.id);
      voiceInstance.ownerId = hashids.encode(voiceInstance.ownerId);
      voiceInstance.title = sanitize(voiceInstance.title);
      voiceInstance.description = sanitize(voiceInstance.description);
      voiceInstance.twitterSearch = sanitize(voiceInstance.twitterSearch);
      voiceInstance.locationName = sanitize(voiceInstance.locationName);
      voiceInstance.longitude = sanitize(voiceInstance.longitude);
      voiceInstance.latitude = sanitize(voiceInstance.latitude);

      // skip deleted voices
      if (voiceInstance.deleted) {
        return nextVoice();
      }

      Slug.find(['voice_id = ? ORDER BY id DESC LIMIT 1', [voice.id]], function(err, result) {
        if (err) {
          return nextVoice(err);
        }

        voiceInstance.slug = result[0].url;

        Entity.find({ id : voice.ownerId }, function(err, entities) {
          if (err) {
            return nextVoice(err);
          }

          EntitiesPresenter.build(entities, currentPerson, function(err, result) {
            if (err) {
              return nextVoice(err);
            }

            voiceInstance.owner = result[0];

            // Images
            var images = {};

            for (var version in voiceInstance.imageMeta) {
              images[version] = {
                url : voiceInstance.image.url(version),
                meta : voiceInstance.image.meta(version)
              };
            }

            voiceInstance.images = images;

            var topicIds = [];

            async.series([function(done) {

              // Get topic ids
              VoiceTopic.find({ 'voice_id' : voice.id }, function(err, result) {
                if (err) {
                  return done(err);
                }

                topicIds = result.map(function(item) {
                  return item.topicId;
                });

                done();
              });
            }, function(done) {

              // Topics
              Topic.whereIn('id', topicIds, function(err, result) {
                if (err) {
                  return done(err);
                }

                TopicsPresenter.build(result, function(err, topics) {
                  if (err) {
                    return done(err);
                  }

                  voiceInstance.topics = topics;

                  done();
                });
              });
            }, function(done) {

              // Followers
              VoiceFollower.find({ 'voice_id' : voice.id }, function(err, voiceFollowers) {
                var followerIds = voiceFollowers.map(function(item) {
                  return item.entityId;
                });

                // Is the currentPerson Following?
                voiceInstance.followed = false;

                if (currentPerson) {
                  if (followerIds.indexOf(hashids.decode(currentPerson.id)[0]) !== -1) {
                    voiceInstance.followed = true;
                  }
                }

                Entity.whereIn('id', followerIds, function(err, result) {
                  if (err) {
                    return done(err);
                  }
                  EntitiesPresenter.build(result, currentPerson, function(err, followers) {
                    if (err) {
                      return done(err);
                    }

                    voiceInstance.followers = followers;

                    done();
                  });
                });
              });
            }, function (next) {

              // Get the Entity IDs that follow this entity, that are owned by currentPerson

              // since it is optional, really
              if (!currentPerson) {
                voiceInstance.followersOwnedByCurrentPerson = false;
                return next();
              }

              var currentPersonEntity = new Entity(currentPerson),
                realCurrentPerson,
                ownedIds = [],
                result = [];

              currentPersonEntity.id = hashids.decode(currentPersonEntity.id)[0];

              async.series([
                // get real entity
                function (done) {
                  currentPersonEntity.owner(function (err, owner) {
                    if (err) { return done(err); }

                    if (currentPerson.isAnonymous) {
                      realCurrentPerson = new Entity(owner);
                    } else {
                      realCurrentPerson = new Entity(currentPersonEntity);
                    }

                    return done();
                  });
                },

                // get owned entities
                function (done) {
                  EntityOwner.find({ owner_id: realCurrentPerson.id }, function (err, owned) {
                    if (err) { return done(err); }

                    ownedIds = owned.map(function (entity) {
                      return entity.ownedId;
                    });
                    ownedIds.push(realCurrentPerson.id);

                    return done();
                  });
                },

                // get follow records where one of these entities are found
                function (done) {
                  db('VoiceFollowers')
                    .whereIn('entity_id', ownedIds)
                    .andWhere('voice_id', voice.id)
                    .asCallback(function (err, rows) {
                      if (err) { return done(err); }

                      result = rows.map(function (row) {
                        return hashids.encode(row.entity_id);
                      });

                      return done();
                    });
                }
              ], function (err) { // async.series
                if (err) { return next(err); }

                voiceInstance.followersOwnedByCurrentPerson = result;

                return next();
              });
            }, function (done) {
              db('Posts').count('*').where({
                'voice_id': voice.id,
                'approved': true
              }).asCallback(function (err, rows) {
                if (err) { return done(err); }

                voiceInstance.postsCount = parseInt(rows[0].count, 10);

                return done();
              });
            }], function(err) {
              if (err) {
                return nextVoice(err);
              }

              delete voiceInstance.imageMeta;
              delete voiceInstance.imageBaseUrl;
              delete voiceInstance.ownerId;

              response.push(voiceInstance);

              nextVoice();
            });
          });
        });
      });
    }, function(err) {
      return callback(err, response);
    });
  }
});

module.exports = VoicesPresenter;
