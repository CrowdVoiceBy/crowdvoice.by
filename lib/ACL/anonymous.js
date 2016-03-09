ACL.addRole(new ACL.Role('Anonymous'), ['Visitor']);

var findAnonRealEntity = function(currentPerson, callback) {
  var person = new Entity(currentPerson);
  person.id = hashids.decode(person.id)[0];

  person.owner(function(err, result) {
    if (err) { return callback(err); }

    if (currentPerson.isAnonymous) {
      return callback(null, new Entity(result));
    } else {
      return callback(null, new Entity(person));
    }
  });
}

ACL.allow('show', 'threads', 'Anonymous', function(acl, args, next) {
  if (args.currentPerson.profileName === args.profileName) {
    return next(null, true);
  }

  return next(null, false);
});


/*
  =======================
  PostsController
  =======================
*/

// if voice is public then yes, otherwise you must be an owner, member or
// contributor.
// returns an anonymous entity to be the post owner if it is necessary.
ACL.allow(['preview', 'create', 'upload'], 'posts', 'Anonymous', function(acl, data, next) {
  /* data = {
   *   currentPerson: Entity,
   *   activeVoice: Voice,
   *   voiceOwnerProfile: String,
   * }
   */

  var postOwner = new Entity(data.currentPerson),
    realCurrentPerson,
    voiceOwner,
    anonymousEntity,
    isAnonymous = postOwner.isAnonymous,
    isVoiceCollaborator = false,
    isOrganizationMember = false,
    isOrganizationOwner = false;

  postOwner.id = hashids.decode(data.currentPerson.id)[0];

  async.series([
    // find real person
    function (done) {
      postOwner.owner(function(err, result) {
        if (err) { return done(err); }

        if (data.currentPerson.isAnonymous) {
          realCurrentPerson = new Entity(result);
        } else {
          realCurrentPerson = new Entity(postOwner);
        }

        realCurrentPerson.getAnonymousEntity(function (err, anon) {
          if (err) { return done(err); }

          anonymousEntity = new Entity(anon);

          return done();
        });
      });
    },

    // find owner of voice
    function (done) {
      Entity.find({
        profile_name: data.voiceOwnerProfile
      }, function (err, result) {
        if (err) { return next(err); }

        if (result.length < 1) {
          return next(new NotFoundError('Profile not found'));
        }

        voiceOwner = new Entity(result[0]);

        return done();
      })
    },

    // if collaborator
    function (done) {
      VoiceCollaborator.find({
        voice_id: data.activeVoice.id,
        collaborator_id: realCurrentPerson.id
      }, function (err, result) {
        if (err) { return next(err); }

        if (result.length > 0) {
          isVoiceCollaborator = true;

          if (result[0].isAnonymous) {
            isAnonymous = true;
          }
        }

        return done();
      });
    },

    // if member
    function (done) {
      EntityMembership.find({
        entity_id: voiceOwner.id,
        member_id: realCurrentPerson.id
      }, function (err, result) {
        if (err) { return next(err); }

        if (result.length > 0) {
          isOrganizationMember = true;

          if (result[0].isAnonymous) {
            isAnonymous = true;
          }
        }

        return done();
      });
    },

    // is org owner
    function(done) {
      realCurrentPerson.isOwnerOf(voiceOwner.id, function(err, result) {
        if (err) {
          return done(err);
        }

        if (result) {
          isOrganizationOwner = true;
        }

        return done();
      });
    },

    // anonymous
    function (done) {
      if (!isAnonymous) {
        return done();
      }

      realCurrentPerson.getAnonymousEntity(function (err, anon) {
        if (err) { return done(err); }

        anonymousEntity = new Entity(anon);
        postOwner = new Entity(anon);

        return done();
      });
    }
  ], function (err) {
    if (err) { return next(err); }

    var response = {
      postOwner: postOwner,
      isVoiceCollaborator: isVoiceCollaborator,
      isOrganizationMember: isOrganizationMember,
      isOrganizationOwner: isOrganizationOwner,
      isVoiceDirectOwner: false,
      isVoiceIndirectOwner: false,
      isAllowed: false
    }

    if (realCurrentPerson.id === data.activeVoice.ownerId) {
      response.isVoiceDirectOwner = true;
    } else if (anonymousEntity.id === data.activeVoice.ownerId) {
      response.isVoiceIndirectOwner = true;
    }

    if (data.activeVoice.type === Voice.TYPE_CLOSED) {
      if (response.isVoiceIndirectOwner
        || response.isVoiceDirectOwner
        || isVoiceCollaborator
        || isOrganizationMember
        || isOrganizationOwner
        || realCurrentPerson.isAdmin) {

        response.isAllowed = true;
      }
    } else {
      response.isAllowed = true;
    }

    return next(null, response);
  });
});

ACL.allow(['update', 'destroy', 'deleteOlderThan', 'deleteAllUnmoderated'], 'posts', 'Anonymous', function(acl, data, next) {
  var currentPerson,
    voice,
    profile,
    isVoiceCollaborator = false,
    isOrganizationMember = false;

  async.series([function(done){
    var person = new Entity(data.currentPerson);
    person.id = hashids.decode(person.id)[0];

    person.owner(function(err, result) {
      if (err) {return done(err)};

      if (data.currentPerson.isAnonymous) {
        currentPerson = new Entity(result);
      } else {
        currentPerson = new Entity(person);
      }

      return done();

    });
  },function(done) {
    Voice.findBySlug(data.voiceSlug, function(err, result) {

      if (err) {return done(err)};

      voice = new Voice(result);

      done();
    })
  }, function(done) {
    Entity.find({profile_name : data.profileName}, function(err, result) {
      if (err) {return next(err)}

      if (result.length === 0) { return next(new NotFoundError('Profile not found'))};

      profile = new Entity(result[0]);

      done();
    })
  }, function(done) {
    VoiceCollaborator.find({voice_id : voice.id, collaborator_id : currentPerson.id}, function(err, result) {
      if (err) {return next(err)}

      if (result.length !== 0) { isVoiceCollaborator = true };

      done();
    })
  }, function(done) {
    currentPerson.isMemberOf(profile.id, function(err, isMember) {

      isOrganizationMember = isMember;

      done();
    })
  }, function(done) {
    currentPerson.isOwnerOf(profile.id, function(err, result) {
      if (err) {
        return done(err);
      }

      isOrganizationOwner = result;
      done();
    })
  }], function(err) {
    if (err) {return next(err)}

    var response = {
      voice : voice,
      currentPerson : currentPerson,
      isVoiceCollaborator : isVoiceCollaborator,
      isOrganizationMember : isOrganizationMember,
      isAllowed : false
    }

    if (voice.type === Voice.TYPE_CLOSED) {
      if (currentPerson.id === voice.ownerId) {
        response.isAllowed = true;
      }

      if (isVoiceCollaborator === true) {
        response.isAllowed = true;
      }

      if (isOrganizationOwner) {
        response.isAllowed = true;
      }

      if (isOrganizationMember === true) {
        response.isAllowed = true;
      }
    } else {
      response.isAllowed = true;
    }

    return next(null, response);

  })
});



/* ====================
   VoicesController
   ====================
*/

// CHECKS IF IS VOICE OWNER
ACL.allow(['manageRelatedVoices', 'inviteToContribute', 'removeContributor'], 'voices', 'Anonymous', function (acl, data, respond) {
  /*
   * data = {
   *   currentPerson,
   *   voiceId
   * }
   */

  var voice,
    voiceOwner,
    currentPerson,
    isAllowed = false;

  async.series([
    // get currentPerson
    function (next) {
      findAnonRealEntity(data.currentPerson, function (err, person) {
        if (err) { return next(err); }

        currentPerson = person;

        return next();
      });
    },

    // get voice
    function (next) {
      Voice.findById(data.voiceId, function (err, result) {
        if (err) { return next(err); }

        voice = result[0];

        return next();
      });
    },

    // get voice owner
    function (next) {
      Entity.findById(voice.ownerId, function (err, result) {
        if (err) { return next(err); }

        voiceOwner = new Entity(result[0]);

        return next();
      });
    },

    // check if entity is voice owner
    function (next) {
      if (voice.ownerId === currentPerson.id) {
        isAllowed = true;

        return next();
      } else {
        voiceOwner.owner(function (err, result) {
          if (err) { return next(err); }

          if (result.id === currentPerson.id) {
            isAllowed = true;
          }

          return next();
        });
      }
    },

    // check if organization owner
    function(next) {
      var orgIds = currentPerson.organizations.map(function(item) {
        return hashids.decode(item.id)[0];
      });

      if (orgIds.indexOf(voice.ownerId) !== -1) {
        isAllowed = true;
      }

      next();
    }
  ], function (err) { // async.series
    if (err) { return respond(err); }

    return respond(null, {
      isAllowed: isAllowed,
      owner: currentPerson,
      voice: voice
    });
  });
});

ACL.allow('show', 'voices', 'Anonymous', function(acl, data, next) {
  /**
   * data = {
   *   currentPerson: req.currentPerson
   *   voice: req.activeVoice
   *   profileName: req.params.profileName
   * }
   */

  var voice = data.voice;
  var currentPerson;
  var anonymous = false;
  var profile;
  var isVoiceCollaborator = false;
  var isOrganizationMember = false;
  var isOrganizationOwner = false;
  var isVoiceOwner = false;

  async.series([function(done) {
    currentPerson = new Entity(data.currentPerson);
    currentPerson.id = hashids.decode(currentPerson.id)[0];

    if (!currentPerson.isAnonymous) {
      return done();
    }

    // if its anonymous get the real entity
    currentPerson.owner(function(err, result) {
      if (err) {
        return done(err);
      }

      // currentPerson is now not an anonymous entity.
      currentPerson = new Entity(result);

      done();
    });
  }, function(done) {
    if (data.profileName.search(/anonymous/) !== -1) {
      profile = false;
      return done();
    }

    Entity.find({profile_name : data.profileName}, function(err, result) {
      if (err) {return next(err)}

      if (result.length === 0) { return next(new NotFoundError('Profile not found'))};

      profile = new Entity(result[0]);

      done();
    })
  }, function(done) {
    VoiceCollaborator.find({
      voice_id: voice.id,
      collaborator_id: currentPerson ? currentPerson.id : 0
    }, function(err, result) {
      if (err) { return next(err); }

      if (result.length > 0) {
        isVoiceCollaborator = true
      };

      done();
    })
  }, function(done) {
    currentPerson.isMemberOf(voice.ownerId, function(err, isMember) {
      if (err) { return done(err); }

      isOrganizationMember = isMember;

      done();
    })
  }, function(done) {
    currentPerson.isOwnerOf(voice.ownerId, function(err, result) {
      if (err) { return done(err); }

      isOrganizationOwner = result;

      done();
    })
  }, function (done) {
    if (voice.ownerId === currentPerson.id) {
      isVoiceOwner = true;
    }

    return done();
  }], function(err) {
    if (err) {
      return next(err);
    }

    var response = {
      isAllowed : true,
      allowPosting : false,
      allowPostEditing : false
    }

    if (profile) {
      if (profile.id !== voice.ownerId) {
        response.isAllowed = false;
      }
    }

    if (isVoiceOwner) {
      response.allowPostEditing = true;
    }

    if (isVoiceCollaborator) {
      response.allowPostEditing = true;
    }

    if (isOrganizationMember) {
      response.allowPostEditing = true;
    }

    if (isOrganizationOwner) {
      response.allowPostEditing = true;
    }

    if (voice.status !== Voice.STATUS_PUBLISHED && voice.status !== Voice.STATUS_UNLISTED) {
      response.isAllowed = false;

      if (isOrganizationOwner || isVoiceOwner) {
        response.isAllowed = true;
      }
    }

    if (voice.type === Voice.TYPE_CLOSED) {
      if (isVoiceOwner) {
        response.allowPosting = true;
      }

      if (isVoiceCollaborator) {
        response.allowPosting = true;
      }

      if (isOrganizationOwner) {
        response.allowPosting = true;
      }

      if (isOrganizationMember) {
        response.allowPosting = true;
      }
    } else {
      response.allowPosting = true;
    }

    return next(null, response);

  })

})

ACL.allow(['create'], 'voices', 'Anonymous', function(acl, data, next) {
  return next(null, { isAllowed : true });
});

ACL.allow(['edit', 'update', 'isVoiceSlugAvailable'], 'voices', 'Anonymous', function(acl, data, respond) {
  findAnonRealEntity(data.currentPerson, function (err, owner) {
    if (err) { return respond(err); }

    EntityOwner.find({ owner_id: owner.id }, function (err, owners) {
      if (err) { return respond(err); }

      var ids = owners.map(function (rec) {
        return rec.ownedId;
      });
      ids.push(owner.id)

      db('Voices')
        .whereIn('owner_id', ids)
        .andWhere('id', '=', data.voice.id)
        .asCallback(function (err, rows) {
          if (err) { return respond(err); }

          return respond(null, {
            isAllowed: rows.length > 0
          });
        });
    });
  });
});

ACL.allow('delete', 'voices', 'Anonymous', function(acl, data, respond) {
  findAnonRealEntity(data.currentPerson, function (err, owner) {
    if (err) { return respond(err); }

    EntityOwner.find({ owner_id: owner.id }, function (err, owners) {
      if (err) { return respond(err); }

      var ids = owners.map(function (rec) {
        return rec.ownedId;
      });
      ids.push(owner.id)

      db('Voices')
        .whereIn('owner_id', ids)
        .andWhere('id', '=', data.voice.id)
        .andWhere('status', Voice.STATUS_DRAFT)
        .asCallback(function (err, rows) {
          if (err) { return respond(err); }

          return respond(null, {
            isAllowed: rows.length > 0
          });
        });
    });
  });
});

ACL.allow('archiveVoice', 'voices', 'Anonymous', function (acl, data, respond) {
  findAnonRealEntity(data.currentPerson, function (err, owner) {
    if (err) { return respond(err); }

    EntityOwner.find({ owner_id: owner.id }, function (err, owned) {
      var ids = owned.map(function (record) { return record.ownedId });
      ids.push(owner.id);

      Voice.findById(data.voiceId, function (err, activeVoice) {
        if (err) { return respond(err); }

        return respond(null, (
          activeVoice.length > 0
          && _.find(ids, function (id) { return id === activeVoice[0].ownerId }) !== undefined
        ));
      });
    });
  });
});

/* ENTITIES */

ACL.allow('createOrganization', 'entities', 'Anonymous', function (acl, data, respond) {
  // data = {
  //   profileName, currentPerson
  // }

  var isAllowed = true;

  if (data.profileName === data.currentPerson.profileName) {
    isAllowed = false;
  }

  if (data.profileName.match(BlackListFilter.routesBlackList[1])) {
    isAllowed = false;
  }

  return respond(null, isAllowed);
});

ACL.allow(['myVoices', 'getOrganizations'], 'entities', 'Anonymous', function (acl, data, next) {
  // if the profile we're looking at (currentEntity) is the same as the user
  // that is logged in as anonymous (currentPerson)
  if (data.currentEntity.profileName === data.currentPerson.profileName) {
    findAnonRealEntity(data.currentPerson, function (err, result) {
      if (err) { return next(err); }

      return next(null, { isAllowed: true, entity: result });
    });
  } else {
    return next(null, { isAllowed: false });
  }
});

ACL.allow(['feed', 'home'], 'entities', 'Anonymous', function (acl, data, next) {
  var isOrg = false,
    isAllowed = false,
    profileEntity,
    returnFollower;

  async.series([
    // does the profile name belong to an organization?
    function (next) {
      Entity.find({ profile_name: data.entityProfileName }, function (err, result) {
        if (err) { return next(err); }

        // it's an org, the next step will be skipped
        if (result[0].type === 'organization') {
          isOrg = true;
        }

        // we need this anyhow
        profileEntity = new Entity(result[0]);

        next();
      });
    },

    // in the case that it's not an org
    function (next) {
      // not an org, check if profile and currentPerson are the same
      if (!isOrg) {
        if (data.entityProfileName === data.currentPerson.profileName) {
          // he is allowed since they are the same person
          isAllowed = true;
          // we'll return the feed for the owner of profile
          returnFollower = profileEntity;
        }
      }

      next();
    },

    // in the case that it *is* an org
    function (next) {
      if (isOrg) {
        // gotta make sure we have the info we need
        findAnonRealEntity(data.currentPerson, function (err, currentPerson) {
          if (err) { return next(err); }

          // find the ownership
          EntityOwner.find({
            owned_id: profileEntity.id
          }, function (err, ownership) {
            if (err) { return next(err); }

            if (ownership[0].ownerId === currentPerson.id) {
              // is owner so he is allowed
              isAllowed = true;
              // get the feed for the org
              returnFollower = profileEntity;
            }

            next();
          });
        });
      } else {
        next();
      }
    }
  ], function (err) {
    if (err) { return next(err); }

    return next(null, { isAllowed: isAllowed, follower: returnFollower });
  });
});

ACL.allow('savedPosts', 'entities', 'Anonymous', function(acl, data, next) {
  var currentPerson = data.currentPerson;

  if (data.currentEntity.profileName === data.currentPerson.profileName) {
    findAnonRealEntity(currentPerson, function (err, result) {
      if (err) { return next(err); }

      return next(null, { isAllowed: true, entity: result });
    });
  } else {
    return next(null, { isAllowed: false });
  }
});

ACL.allow('getNotifications', 'entities', 'Anonymous', function (acl, data, next) {
  // although the person is anonymous, they do have a feed to look at
  if (data.currentEntity.profileName === data.currentPerson.profileName) {
    return next(null, { isAllowed: true });
  } else {
    return next(null, { isAllowed: false });
  }
});

// Notifications

ACL.allow('markAsRead', 'notifications', 'Anonymous', function (acl, data, respond) {
  /* data = {
   *   currentPerson
   *   notificationId
   * }
   */

  findAnonRealEntity(data.currentPerson, function (err, currentPerson) {
    if (err) { return respond(err); }

    EntityOwner.find({ owner_id: currentPerson.id }, function (err, entities) {
      var ids = entities.map(function (entity) { return entity.id })
      ids.push(currentPerson.id)

      db('Notifications')
        .whereIn('follower_id', ids)
        .andWhere('read', '=', false)
        .andWhere('id', '=', hashids.decode(data.notificationId)[0])
        .asCallback(function (err, result) {
          if (err) { return next(err) }

          return respond(null, result.length > 0);
        });
    });
  });
});

ACL.allow('markAllAsRead', 'notifications', 'Anonymous', function (acl, data, respond) {
  /* data = {
   *   currentPerson
   * }
   */

  findAnonRealEntity(data.currentPerson, function (err, currentPerson) {
    if (err) { return respond(err); }

    return respond(null, {
      isAllowed: true,
      follower: currentPerson
    });
  });
});

// PostsController

ACL.allow(['savePost', 'unsavePost'], 'posts', 'Anonymous', function(acl, data, next) {
  findAnonRealEntity(data.currentPerson, function(err, realEntity) {
    if (err) {
      return next(err);
    }

    return next(null, { isAllowed : true, person : realEntity });
  });

});

/* =====
 * ADMIN
 * =====
 */

var isAdmin = function (currentPerson, next) {
  findAnonRealEntity(currentPerson, function (err, realEntity) {
    if (err) { return next(err); }

    return next(null, realEntity.isAdmin);
  });
}

ACL.allow('index', 'admin', 'Anonymous', function(acl, data, next) {
  return isAdmin(data.currentPerson, next);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.people', 'Anonymous', function(acl, data, next) {
  return isAdmin(data.currentPerson, next);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.organizations', 'Anonymous', function(acl, data, next) {
  return isAdmin(data.currentPerson, next);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.users', 'Anonymous', function(acl, data, next) {
  return isAdmin(data.currentPerson, next);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.voices', 'Anonymous', function(acl, data, next) {
  return isAdmin(data.currentPerson, next);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.topics', 'Anonymous', function(acl, data, next) {
  return isAdmin(data.currentPerson, next);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy', 'updatePositions', 'searchVoices'], 'admin.featuredVoices', 'Anonymous', function(acl, data, next) {
  return isAdmin(data.currentPerson, next);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy', 'updatePositions', 'searchEntities'], 'admin.featuredEntities', 'Anonymous', function(acl, data, next) {
  return isAdmin(data.currentPerson, next);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.homepageTopVoices', 'Anonymous', function (acl, data, next) {
  return isAdmin(data.currentPerson, next);
});
