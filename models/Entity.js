var ImageUploader = require(path.join(process.cwd(), 'lib', 'image_uploader.js'));

var Entity = Class('Entity').inherits(Argon.KnexModel).includes(ImageUploader)({

  validations : {
    type: [
      'required',
      {
        rule: function (val) {
          if (!val.match(/(person|organization)/)) {
            throw new Checkit.FieldError('Entity type must be person|organization.')
          }
        },
        message: 'Entity type must be person|organization'
      }
    ],
    name: ['required', 'minLength:1', 'maxLength:512'],
    isAnonymous: ['boolean'],
    profileName: [
      'required',
      {
        rule: function(val) {
          if (val.match(/[^a-zA-Z0-9_-]/)) {
            throw new Checkit.FieldError('Profile name should only contain letters, numbers and dashes.');
          }
        },
        message : 'Profile name should only contain letters, numbers and dashes.'
      }
    ],
    description: ['maxLength:140'], // short bio
  },

  storage : (new Argon.Storage.Knex({
    tableName : 'Entities',
    queries : {
      searchPeople : function(reqObj, callback) {
        db(reqObj.model.storage.tableName)
          .where('is_anonymous', '=', false)
          .andWhere('type', '=', 'person')
          .andWhereRaw("(name like ? OR profile_name like ?)",['%' + reqObj.params.value + '%', '%' + reqObj.params.value + '%'])
          .andWhere('id', '!=', reqObj.params.currentPersonId)
          .asCallback(callback)
      },

      whereIn : function(requestObj, callback) {
        db(requestObj.model.storage.tableName).whereIn(requestObj.columnName, requestObj.array).asCallback(callback);
      }
    },

    searchPeople : function searchPeople(requestObj, callback) {
      // var data;
      var storage = this;

      for (i = 0; i < storage.preprocessors.length; i++) {
        requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
      }


      this.queries.searchPeople(requestObj, function(err, data) {
        for (i = 0; i < storage.processors.length; i++) {
          data = storage.processors[i](data, requestObj);
        }

        return callback(err, data);
      });
    },

    whereIn : function whereIn(requestObj, callback) {
      // var data;
      var storage = this;

      for (i = 0; i < storage.preprocessors.length; i++) {
        requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
      }

      this.queries.whereIn(requestObj, function(err, data) {
        for (i = 0; i < storage.processors.length; i++) {
          data = storage.processors[i](data, requestObj);
        }

        return callback(err, data);
      });
    }
  })),

  searchPeople : function searchPeople(params, callback) {
    var Model, request;

    Model = this;

    request = {
      action : 'searchPeople',
      model : Model,
      params : params
    }


    this.dispatch('beforeSearchPeople');

    this.storage.searchPeople(request, function(err, data) {
      callback(err, data);
      Model.dispatch('afterSearchPeople');
    });

    return this;
  },

  whereIn : function WhereIn(columnName, array, callback) {
    var Model, request;

    Model = this;

    request = {
      action : 'whereIn',
      model : Model,
      columnName : columnName,
      array : array
    };

    this.dispatch('beforeWhereIn');

    this.storage.whereIn(request, function(err, data) {
      callback(err, data);
      Model.dispatch('afterWhereIn');
    });

    return this;
  },

  prototype : {
    id: null,
    type: null,
    name: null,
    profileName: null,
    isAnonymous: false,
    description : '',
    location : '',
    createdAt: null,
    updatedAt: null,
    deleted: false,
    lastNotificationDate : null,

    init : function init(config) {
      Argon.KnexModel.prototype.init.call(this, config);

      var model = this;

      this.bind('beforeSave', function() {
        model.profileName = model.profileName.toLowerCase().trim();
      });

      // Add image attachment
      this.hasImage({
        propertyName: 'image',
        versions: {
          icon: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(16,16)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .embed()
                .crop(sharp.gravity.center)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
            );
          },
          notification: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(28,28)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .embed()
                .crop(sharp.gravity.center)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
            );
          },
          small: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(36,36)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .embed()
                .crop(sharp.gravity.center)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
            );
          },
          card: function (readStream) {
            return readStream.pipe(
              sharp()
              .resize(88,88)
              .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
              .embed()
              .crop(sharp.gravity.center)
              .progressive()
              .flatten()
              .background('#FFFFFF')
              .quality(100)
            );
          },
          medium: function (readStream) {
            return readStream.pipe(
              sharp()
              .resize(160,160)
              .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
              .embed()
              .crop(sharp.gravity.center)
              .progressive()
              .flatten()
              .background('#FFFFFF')
              .quality(100)
            );
          }
        },
        bucket: 'crowdvoice.by',
        basePath: '{env}/{modelName}_{id}/{property}_{versionName}.{extension}'
      });

      // Add image attachment
      this.hasImage({
        propertyName: 'background',
        versions: {
          card: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(440)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .quality(100)
            );
          },
          bluredCard: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(440)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .blur(5)
                .quality(100)
            );
          },
          big: function (readStream) {
            return readStream.pipe(
              sharp()
                .resize(2560, 1113)
                .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
                .progressive()
                .flatten()
                .background('#FFFFFF')
                .blur(25)
                .quality(100)
            );
          }
        },
        bucket: 'crowdvoice.by',
        basePath: '{env}/{modelName}_{id}/{property}_{versionName}.{extension}'
      });
    },

    /* Mark an entity as deleted
     * @method: markAsDeleted
     * @params:
     *  + entity
     *  + callback
     */

    markAsDeleted : function markAsDeleted(callback) {
      if (!this.id) {
        return callback(new Error('Invalid ID'));
      }

      this.deleted = true;

      this.save(callback);
    },

    /* Starts following an entity
     * @method: followEntity
     * @params:
     *  + entity
     *  + callback
     */
    followEntity : function followEntity (entity, callback) {
      var currentEntity = this;

      // We try to find first if the relation already exists,
      // so we don't duplicate it.
      EntityFollower.find({
        follower_id: currentEntity.id,
        followed_id: entity.id
      }, function (err, result) {
        if (err) { return callback(err); }
        if (result.length > 0) {
          return done(null);
        }

        var entityFollower = new EntityFollower({
          followerId: currentEntity.id,
          followedId: entity.id
        });
        entityFollower.save(function (err, result) {
          callback(err, result);
        });
      });
    },

    /* Unfollows an entity
     * @method: unfollowEntity
     * @params:
     *  + entity
     *  + callback
     */
    unfollowEntity : function unfollowEntity (entity, callback) {
      currentEntity = this;

      EntityFollower.find({
        follower_id: currentEntity.id,
        followed_id: entity.id
      }, function (err, result) {
        if (err) { return callback(err); }
        if (result === 0) { // actually we're not following anything
          return callback(null);
        }

        var entityFollower = new EntityFollower(result[0]);

        entityFollower.destroy(callback)
      });
    },

    /* Returns the current entity followers
     * @method: followers
     * @params:
     *  + callback
     */
    followers : function followers (done) {
      db('Entities')
        .select('Entities.*')
        .rightJoin('EntityFollower', 'Entities.id', 'EntityFollower.follower_id')
        .where('followed_id', '=', this.id)
        .asCallback(done);
    },

    /* Returns the followedEntities made by the current entity
     * @method: followedEntities
     */
    followedEntities : function followedEntities (done) {
      db('Entities')
        .select('Entities.*')
        .rightJoin('EntityFollower', 'Entities.id', 'EntityFollower.followed_id')
        .where('follower_id', '=', this.id)
        .asCallback(done);
    },

    /* Follows a voice
     * @method followVoice
     * @params:
     *  + voice
     *  + callback
     */
    followVoice: function followVoice (voice, callback) {
      var vf = new VoiceFollower({
        entityId: this.id,
        voiceId: voice.id
      });
      vf.save(callback);
    },

    /* Unfollows a voice
     * @method: unfollowVoice
     * @params:
     *  + entity
     *  + callback
     */
    unfollowVoice : function unfollowVoice (voice, callback) {
      currentEntity = this;

      VoiceFollower.find({
        entity_id: currentEntity.id,
        voice_id: voice.id
      }, function (err, result) {
        if (err) { return callback(err); }
        if (result.length === 0) { // actually we're not following anything
          return callback(null);
        }

        var voiceFollower = new VoiceFollower(result[0]);

        voiceFollower.destroy(callback)
      });
    },

    /* Followed voices
     * @method: followedVoices
     * @params:
     *  + callback
     */
    followedVoices: function followedVoices (done) {
      db('Voices')
        .select('Voices.*')
        .rightJoin('VoiceFollowers', 'Voices.id', 'VoiceFollowers.voice_id')
        .where('entity_id', '=', this.id)
        .asCallback(done);
    },

    /* Invite another entity to join the organization
     * @method inviteEntity
     * @property entity <Object>
     * @return undefined
     */
    inviteEntity: function inviteEntity (entity, done) {
      var currentEntity = this;

      // We try to find first if the relation already exists,
      // so we don't duplicate it.
      InvitationRequest.find({
        invitator_entity_id: currentEntity.id,
        invited_entity_id: entity.id
      }, function (err, result) {
        if (err) { done(err); return; }
        if (result.length > 0) {
          done(null);
        } else {
          var invite = new InvitationRequest({
            invitatorEntityId: currentEntity.id,
            invitedEntityId: entity.id
          });
          invite.save(function (err, result) {
            done(err, result);
          });
        }
      });
    },

    /* Make an entity belong to current entity.
     * @method setOwnershipTo
     * @property entity <Object>
     * @return undefined
     */
    setOwnershipTo : function setOwnershipTo(entity, done) {
      var ownerRelation = new EntityOwner({
        ownerId: this.id,
        ownedId: entity.id
      });

      ownerRelation.save(function(err, result) {
        done(err, result);
      });
    },

    /* Make an organization belong to current entity.
     * @method ownOrganization
     * @property organization <Object>
     * @return undefined
     */
    ownOrganization: function ownOrganization (organization, done) {
      var ownerRelation = new EntityOwner({
        ownerId: this.id,
        ownedId: organization.id
      });
      ownerRelation.save(function (err, result) {
        done(err, result);
      });
    },

    /* Return owner, if any.
     * @method owner
     * @return entity <Object>
     */
    owner: function owner (done) {
      if (!done) { return; }

      var entity = this;
      EntityOwner.find({
        owned_id: entity.id
      }, function (err, result) {
        if (err) { done(err); return; }

        if (result.length === 0) {
          done(null, [])
        } else {
          Entity.find({id: result[0].ownerId}, function (err, result) {

            if (err) { done(err); return; }
            done(null, result[0]);
          });
        }
      });
    },

    isOwnerOf : function isOwnerOf(entityId, callback) {
      if (!this.id) {
        return callback(new Error('Entity doesn\'t have an ID'));
      }

      EntityOwner.find({
        owner_id: this.id,
        owned_id: entityId
      }, function(err, result) {
        if (err) {
          return callback(err);
        }

        if (result.length === 0) {
          return callback(null, false);
        } else {
          return callback(null, true);
        }
      });
    },

    addMember : function addMember(person, callback) {
      if (!this.id) {
        return callback(new Error('Must have an ID'));
      }

      if (this.type !== 'organization') {
        return callback(new Error('Entity is not an organization'));
      }

      if (person.type !== 'person') {
        return callback(new Error('Member is not a person'));
      }

      var entityMembership = new EntityMembership({
        entityId : this.id,
        memberId : person.id
      });

      return entityMembership.save(callback);
    },

    isMemberOf : function isMemberOf(entityId, callback) {
      if (!this.id) {
        return callback("Entity doesn't have an ID");
      }

      EntityMembership.find({'entity_id' : entityId, 'member_id' : this.id}, function(err, result) {
        if (err) {
          return callback(err);
        }

        if (result.length === 0) {
          return callback(null, false);
        } else {
          return callback(null, true);
        }
      });
    },

    ownedOrganizations : function ownOrganizations(callback) {
      var entity = this;

      if (!this.id) {
        return callback(new Error("Entity doesn't have an id"));
      }

      EntityOwner.find({'owner_id' : entity.id}, function(err, result) {
        if (err) {
          return callback(err);
        }

        var ownedIds = result.map(function(item) {return item.ownedId});

        if (ownedIds.length === 0) {
          return callback();
        }

        Entity.whereIn('id', ownedIds, function(err, result) {
          if (err) {
            return callback(err);
          }

          result = result.filter(function(item) {
            if (item.type === 'organization') {
              return true;
            }
          });

          callback(null, result)
        })
      })

    },

    /* Return organizations for which the current entity is owner or member.
     * @method organizations
     * @return callback(err <Error>, organizations <Array>) <Callback>
     */
    organizations : function organizations(callback) {
      var entity = this;

      if (!this.id) {
        return callback(new Error("Entity doesn't have an ID"));
      }

      var organizations = [];

      async.series([function(done) {
        EntityOwner.find({'owner_id' : entity.id}, function(err, result) {
          if (err) {
            return done(err);
          }

          var ownedIds = result.map(function(item) {return item.ownedId});

          if (ownedIds.length === 0) {
            return done();
          }

          Entity.whereIn('id', ownedIds, function(err, result) {
            if (err) {
              return done(err);
            }

            result = result.filter(function(item) {
              if (item.type === 'organization') {
                return true;
              }
            });

            organizations = organizations.concat(result);

            done();
          });
        });
      }, function(done) {
        EntityMembership.find({'member_id': entity.id}, function(err, result) {
          if (err) {
            return done(err);
          }

          var entityIds = result.map(function(item) {return item.entityId});

          if (entityIds.length === 0) {
            return done();
          }

          Entity.whereIn('id', entityIds, function(err, result) {
            if (err) {
              return done(err);
            }

            result = result.filter(function(item) {
              if (item.type === 'organization') {
                return true;
              }
            });

            organizations = organizations.concat(result);

            done();
          })
        })
      }], function(err) {
        if (err) {
          logger.error(err)
          return callback(err);
        }

        organizations = organizations.filter(function(item) {return item.type === 'organization'})

        var result = [];

        organizations.forEach(function(organization) {
          var orgInstance = new Entity(organization);

          orgInstance = orgInstance.toJSON()
          result.push(orgInstance)
        })

        callback(null, result)
      })
    },

    /* Return voices for which the current entity is owner.
     * @method voices
     * @return voices <Array>
     */
    voices: function voices (done) {
      Voice.find({owner_id: this.id}, done);
    },

    /* Returns, for a given entity, the set of voices that belong
     * to those entities that the given entity is following and are not
     * being followed by the given entity.
     */
    recommendedVoices: function (done) {
      db('Voices')
        .leftJoin('VoiceFollowers', 'Voices.id', 'VoiceFollowers.voice_id')
        .leftJoin('EntityFollower', 'Voices.owner_id', 'EntityFollower.followed_id')
        .whereRaw('("VoiceFollowers".entity_id <> ? or "VoiceFollowers".entity_id is null)', [this.id])
        .andWhere('EntityFollower.follower_id', '=', this.id)
        .asCallback(done);
    },

    getAnonymousEntity : function getAnonymousEntity(callback) {
      if (!this.id) {
        return callback(new Error('Entity doesn\'t have an ID'));
      }

      EntityOwner.find({
        'owner_id' : this.id
      }, function(err, result) {
        if (err) {
          return callback(err);
        }

        var entityIds = result.map(function(item){ return item.ownedId });

        Entity.whereIn('id', entityIds, function(err, result) {
          if (err) {
            return callback(err);
          }

          var anonymous = result.filter(function(item) {
            if (item.isAnonymous) {
              return true;
            }
          });

          if (anonymous.length === 0) {
            return callback(new Error('Entity doesn\'t have an anonymous record'));
          }

          return callback(null, anonymous[0]);
        });
      })
    },

    toJSON : function toJSON() {
      var model = this;
      var json = {};

      Object.keys(this).forEach(function(property) {

        if (property === 'id' && !isNaN(model.id)) {
          json[property] = hashids.encode(model.id);
        } else {
          json[property] = model[property];
        }
      });

      delete json.eventListeners;

      return json;
    }
  }
});

module.exports = Entity;
