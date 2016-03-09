var EntitiesPresenter = Module('EntitiesPresenter')({
  build : function build(entities, currentPerson, callback) {
    var response = [];

    async.eachLimit(entities, 1, function(entity, nextEntity) {
      var entityInstance = new Entity(entity);
      entityInstance.id = hashids.encode(entityInstance.id);

      // skip deleted entities
      if (entityInstance.deleted) {
        return nextEntity();
      }

      var images = {};

      var num = Math.floor(Math.random() * 9) + 1;
      for (var version in entityInstance.image.versions) {
        images[version] = {
          url : entityInstance.image.url(version),
          meta : entityInstance.image.meta(version)
        };

        if (entityInstance.isAnonymous) {
          images[version].url = '/img/anonymous/' + num + '/image_' + version + '.png';
        } else {
          if (!images[version].url) {
            images[version].url = '/img/entity-placeholder/image_' + version + '.png';
          }
        }
      }

      entityInstance.images = images;

      var backgrounds = {};

      for (var version in entityInstance.backgroundMeta) {
        backgrounds[version] = {
          url : entityInstance.background.url(version),
          meta : entityInstance.background.meta(version)
        };
      }

      entityInstance.backgrounds = backgrounds;

      async.series([function(done) {
        db('Voices').count('*').where({
          'owner_id' : entity.id,
          status : 'STATUS_PUBLISHED'
        }).asCallback(function(err, result) {
          if (err) {
            return done(err);
          }

          entityInstance.voicesCount = parseInt(result[0].count, 10);

          done();
        });
      }, function(done) {
        db('EntityFollower').count('*').where({
          'followed_id' :  entity.id
        }).asCallback(function(err, result) {
          if (err) {
            return done(err);
          }

          entityInstance.followersCount = parseInt(result[0].count, 10);

          done();
        });
      }, function(done) {
        db('EntityFollower').count('*').where({
          'follower_id' : entity.id
        }).asCallback(function(err, result) {
          if (err) {
            return done(err);
          }

          var entityFollowingCount = parseInt(result[0].count, 10);

          VoiceFollower.find({
            'entity_id' : entity.id
          }, function(err, result) {
            if (err) {
              return next(err);
            }

            var voiceIds = result.map(function(item) {
              return item.voiceId;
            });

            Voice.whereIn('id', voiceIds, function(err, result) {
              if (err) {
                return next(err);
              }

              var voices = result.filter(function(item) {
                if (item.status === Voice.STATUS_PUBLISHED) {
                  return true;
                }
              });

              entityInstance.followingCount = entityFollowingCount + voices.length;

              done();
            });
          });
        });
      }, function(done) {

        // Is followed by me?
        entityInstance.followed = false;

        if (!currentPerson) {
          return done();
        }

        EntityFollower.find({
          'follower_id' : hashids.decode(currentPerson.id)[0],
          'followed_id' : entity.id
        }, function(err, result) {
          if (err) {
            return done(err);
          }

          if (result.length === 0) {
            return done();
          }

          entityInstance.followed = true;

          done();
        });
      }, function(done) {
        db('EntityMembership').count('*').where({
          'entity_id' : entity.id
        }).asCallback(function(err, result) {
          if (err) {
            return done(err);
          }

          entityInstance.membershipCount = parseInt(result[0].count, 10);

          done();
        });
      }, function(done) {

        // An array of ids of organizations this entity owns or is member of

        var organizationIds = [];

        async.series([function(doneOrgs) {

          // Get owned
          EntityOwner.find({
            owner_id : entity.id
          }, function(err, result) {
            if (err) {
              return doneOrgs(err);
            }

            organizationIds = result.map(function(item) {
              return item.ownedId;
            });

            doneOrgs();
          });
        }, function(doneOrgs) {

          // Get the ones this entity is member of
          EntityMembership.find({
            'member_id' : entity.id
          }, function(err, result) {
            if (err) {
              return doneOrgs(err);
            }

            organizationIds = organizationIds.concat(result.map(function(item) {
              return item.entityId;
            }));

            doneOrgs();
          });
        }], function(err) {
          if (err) {
            return done(err);
          }

          Entity.whereIn('id', organizationIds, function(err, result) {
            if (err) {
              return done(err);
            }

            result = result.filter(function(item) {
              if (item.type === 'organization') {
                return true;
              }
            });

            var filteredOrganizationIds = result.map(function(item) {
              return item.id;
            });

            var response = [];

            filteredOrganizationIds.forEach(function(item) {
              response.push(hashids.encode(item));
            });

            entityInstance.organizationIds = response;

            done();
          });
        });
      }, function(done) {

        // Get the Voice ids that the Entity is owner or contributor
        var voiceIds = [];

        async.series([function(doneVoice) {

          // Get own voices
          Voice.find({
            'owner_id' : entity.id,
            status : Voice.STATUS_PUBLISHED
          }, function(err, result) {
            if (err) {
              return doneVoice(err);
            }

            voiceIds = result.map(function(item) {
              return item.id;
            });

            doneVoice();
          });
        }, function(doneVoice) {

          // Get voices this entity is contributor of
          VoiceCollaborator.find({
            'collaborator_id' : entity.id
          }, function(err, result) {
            if (err) {
              return doneVoice(err);
            }

            voiceIds = voiceIds.concat(result.map(function(item) {
              return item.voiceId;
            }));

            doneVoice();
          });
        }], function(err) {
          if (err) {
            return done(err);
          }

          var result = [];

          voiceIds.forEach(function(item) {
            result.push(hashids.encode(item));
          });

          entityInstance.voiceIds = result;

          done();
        });

      }, function (next) {

        // Get the Entity IDs that follow this entity, that are owned by currentPerson

        // since it is optional, really
        if (!currentPerson) {
          entityInstance.followersOwnedByCurrentPerson = false;
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
            db('EntityFollower')
              .whereIn('follower_id', ownedIds)
              .andWhere('followed_id', entity.id)
              .asCallback(function (err, rows) {
                if (err) { return done(err); }

                result = rows.map(function (row) {
                  return hashids.encode(row.follower_id);
                });

                return done();
              });
          }
        ], function (err) { // async.series inside .followersOwnedByCurrentPerson
          if (err) { return next(err); }

          entityInstance.followersOwnedByCurrentPerson = result;

          return next();
        });
      }, function (nextSeries) {
        if (!currentPerson) {
          return nextSeries();
        }

        db('EntityFollower')
          .where('follower_id', entity.id)
          .andWhere('followed_id', hashids.decode(currentPerson.id)[0])
          .asCallback(function (err, rows) {
            if (err) { return nextSeries(err); }

            if (rows.length > 0) {
              entityInstance.followsCurrentPerson = true;
            } else {
              entityInstance.followsCurrentPerson = false;
            }

            return nextSeries();
          });
      }], function(err) { // async.series for filling each property
        if (err) {
          return nextEntity(err);
        }

        response.push(entityInstance);

        nextEntity();
      })
    }, function(err) { // async.eachLimit
      if (err) {
        return callback(err);
      }

      callback(null, response);
    });
  }
});

module.exports = EntitiesPresenter;
