ACL.addRole(new ACL.Role('Person'), ['Anonymous']);

/*
  ==================
  ThreadsController
  ==================
*/

ACL.addResource(new ACL.Resource('threads'));
// Show inherited from  Anonymous

ACL.allow('create', 'threads', 'Person', function(acl, args, next) {
  var data = args;

  if (data.senderEntityId === data.receiverEntityId) {
    logger.info('senderEntityId is equal to receiverEntityId');
    return next(null, {isAllowed : false});
  }

  if (data.senderPersonId === data.receiverEntityId) {
    logger.info('senderPersonId is equal to receiverEntityId');
    return next(null, {isAllowed : false});
  }

  var senderPerson, senderEntity, receiverEntity;

  async.series([function(done) {
    Entity.findById(data.senderPersonId, function(err, result) {
      if (err) {
        return done(err);
      }

      if (result.length === 0 || result[0].isAnonymous) {
        logger.info('Sender Person Not Found');
        return done(new NotFoundError('Sender Person Not Found.'));
      }

      senderPerson = new Entity(result[0]);

      done();
    });
  }, function(done) {
    Entity.findById(data.senderEntityId, function(err, result) {
      if (err) {
        return done(err);
      }

      if (result.length === 0 || result[0].isAnonymous) {
        logger.info('Sender Entity Not Found');
        return done(new NotFoundError('Sender Entity Not Found.'));
      }

      senderEntity = new Entity(result[0]);

      done();
    });
  }, function(done) {
    Entity.findById(data.receiverEntityId, function(err, result) {
      if (err) {
        return done(err);
      }

      if (result.length === 0 || result[0].isAnonymous) {
        logger.info('Receiver Entity Not Found');
        return done(new NotFoundError('Receiver Entity Not Found.'));
      }

      receiverEntity = new Entity(result[0]);

      done();
    });
  }], function(err) {
    if (err) {
      return next(err);
    }

    var response = {
      senderPerson: senderPerson,
      senderEntity: senderEntity,
      receiverEntity: receiverEntity,
      isAllowed: true
    };

    next(err, response);
  });
});

ACL.allow('update', 'threads', 'Person', function(acl, data, next) {
  MessageThread.findById(data.threadId, function(err, result) {
    if (err) { return next(err); }

    if (result.length === 0) {
      logger.info('Thread not found');
      return next(new NotFoundError('Thread not found.'));
    }

    var thread = result[0];

    var idsToMatch = [
      thread.senderPersonId,
      thread.senderEntityId,
      thread.receiverEntityId
    ];

    db('EntityOwner')
      .whereIn('owned_id', idsToMatch)
      .asCallback(function (err, rows) {
        if (err) { return next(err); }

        var ids = rows.map(function (row) { return row.owner_id; });

        if (ids.concat(idsToMatch).indexOf(data.currentPersonId) !== -1) {
          return next(null, true);
        }

        return next(null, false);
      });
  });
});

ACL.allow('destroy', 'threads', 'Person', function(acl, data, next) {
  MessageThread.findById(data.threadId, function(err, result) {
    if (err) {
      return next(err);
    }

    if (result.length === 0) {
      logger.info('Thread not found');
      return next(new NotFoundError('Thread not found.'));
    }

    var thread = result[0];

    if (data.currentPersonId === thread.senderPersonId || data.currentPersonId === thread.receiverEntityId) {
      return next(null, true);
    }

    return next(null, false);
  });
});

ACL.allow('searchPeople', 'threads', 'Person', function(acl, data, next) {
  if (data.currentPerson.isAnonymous) {
    logger.info('Current person is anonymous');
    return next(null, false);
  }

  return next(null, true);
});

/*
  ==================
  MessagesController
  ==================
*/

ACL.addResource(new ACL.Resource('messages'));

ACL.allow('create', 'messages', 'Person', function(acl, data, next) {
  K.MessageThread.query()
    .where('id', data.threadId)
    .include('receiverEntity')
    .then(function (thread) {
      var ids = [
        thread[0].senderPersonId,
        thread[0].receiverEntityId,
      ];

      return thread[0].receiverEntity.getOwner()
        .then(function (owner) {
          if (owner !== null) {
            ids.push(owner.id)
          }

          return next(null, ids.indexOf(data.currentPersonId) !== -1);
        })
    })
    .catch(next);
});

ACL.allow('destroy', 'messages', 'Person', function(acl, data, next) {
  Message.findById(data.messageId, function(err, result) {
    if (err) {
      return next(err);
    }

    if (result.length === 0) {
      logger.info('Message not found');
      return next(new NotFoundError('Message not found.'));
    }

    var message = result[0];

    if (data.currentPersonId === message.senderPersonId || data.currentPersonId === message.receiverEntityId) {
      return next(null, true);
    }

    return next(null, false);
  });
});

ACL.allow('acceptInvite', 'messages', 'Person', function(acl, data, next) {
  var currentPerson = new Entity(data.currentPerson);
  currentPerson.id = hashids.decode(currentPerson.id)[0];

  var thread = data.thread;
  var message = data.message;
  var invitationRequest = data.invitationRequest;
  var voice = data.voice;
  var organization = data.organization;

  var isAllowed = true;

  if (currentPerson.id !== thread.senderPersonId && currentPerson.id !== thread.receiverEntityId) {
    logger.info('currentPerson.id !== thread.senderPersonId AND currentPerson.id !== thread.receiverEntityId');
    isAllowed = false;
  }

  if (message.threadId !== thread.id) {
    logger.info('Message.threadId !== thread.id');
    isAllowed = false;
  }

  if (!message.invitationRequestId) {
    logger.info('message.invitationRequestId is null or undefined');
    isAllowed = false;
  }

  if (invitationRequest.invitedEntityId !== currentPerson.id) {
    logger.info('Invited entity is not eq to currentPerson.id');
    isAllowed = false;
  }

  return next(null, isAllowed);
});

/*
  VoicesController
*/

ACL.allow('requestToContribute', 'voices', 'Person', function(acl, data, next) {
  /*
   * currentPerson,
   * activeVoice
   */

  if (data.currentPerson.isAnonymous) {
    return next(null, false);
  }

  var isAllowed = true;

  async.series([
    // check if already member
    function (done) {
      VoiceCollaborator.find({
        voice_id: data.activeVoice.id,
        collaborator_id: hashids.decode(data.currentPerson.id)[0]
      }, function (err, contributor) {
        if (err) { return done(err); }

        if (contributor.length > 0) {
          isAllowed = false;
        }

        return done();
      });
    },

    // check if voice is by anonymous
    function (done) {
      Entity.find({
        id: data.activeVoice.ownerId
      }, function (err, owner) {
        if (err) { return done(err); }

        if (owner[0].isAnonymous) {
          isAllowed = false;
        }

        return done();
      });
    }
  ], function(err) {
    if (err) { return next(err); }

    return next(null, isAllowed);
  });
});

// EntitiesController

ACL.allow(['isProfileNameAvailable', 'isEmailAvailable', 'edit', 'update', 'updateNotificationSettings'], 'entities', 'Person', function(acl, data, next) {
  var isAllowed = false;

  if (data.entity.profileName === data.currentPerson.profileName) {
    isAllowed = true;
    return next(null, { isAllowed : isAllowed });
  } else {
    if (data.entity.type === 'organization') {
      var currentPerson = new Entity(data.currentPerson);
      currentPerson.id = hashids.decode(currentPerson.id)[0];

      currentPerson.isOwnerOf(hashids.decode(data.entity.id)[0], function(err, isOwner) {
        if (err) {
          return next(err);
        }

        if (isOwner) {
          isAllowed = true;
        }

        return next(null, { isAllowed : isAllowed });
      });
    } else {
      return next(null, { isAllowed : isAllowed });
    }
  }
});

ACL.allow('updateUser', 'entities', 'Person', function(acl, data, next) {
  if (data.entity.profileName === data.currentPerson.profileName) {
    return next(null, { isAllowed : true });
  } else {
    return next(null, { isAllowed : false });
  }
});

ACL.allow('removeEntityFromOrg', 'entities', 'Person', function (acl, data, next) {
  EntityOwner.find({
    owner_id: hashids.decode(data.currentPersonId)[0],
    owned_id: hashids.decode(data.orgId)[0]
  }, function (err, result) {
    if (err) { return next(err); }

    if (result.length > 0) {
      return next(null, { isAllowed: true });
    } else {
      return next(null, { isAllowed: false });
    }
  });
});

ACL.allow('followAs', 'entities', 'Person', function (acl, data, respond) {
  if (data.currentPersonId === data.followerId) {
    return respond(null, { isAllowed: true });
  }

  EntityOwner.find({
    owner_id: hashids.decode(data.currentPersonId)[0],
    owned_id: hashids.decode(data.followerId)[0]
  }, function (err, result) {
    if (err) { return respond(err); }

    if (result.length > 0) {
      return respond(null, { isAllowed: true });
    } else {
      return respond(null, { isAllowed: false });
    }
  });
});

ACL.allow('leaveOrganization', 'entities', 'Person', function (acl, data, respond) {
  var decoded = {
    currentPersonId: hashids.decode(data.currentPersonId)[0],
    orgId: hashids.decode(data.orgId)[0],
    entityId: hashids.decode(data.entityId)[0]
  },
    isAllowed = false,
    isOwner = false;

  // are the entity being removed and the currentPerson the same
  if (decoded.currentPersonId === decoded.entityId) {
    async.series([
      function (next) {
        // make sure user is not owner of organization
        EntityOwner.find({
          owner_id: decoded.entityId,
          owned_id: decoded.orgId
        }, function (err, result) {
          if (err) { return next(err); }

          if (result.length > 0) {
            isOwner = true;
            isAllowed = false;
          }

          next();
        });
      },

      function (next) {
        if (isOwner) { return next(); }

        // check if the user is part of the organization he's trying to leave
        EntityMembership.find({
          entity_id: decoded.orgId,
          member_id: decoded.entityId
        }, function (err, result) {
          if (err) { return next(err); }

          // he is trying to leave
          if (result.length > 0) {
            isAllowed = true;
          } else {
            isAllowed = false;
          }

          return next();
        });
      }
    ], function (err) {
      if (err) { return respond(err); }

      return respond(null, isAllowed);
    });
  } else {
    return respond(null, isAllowed);
  }
});

ACL.allow('requestMembership', 'entities', 'Person', function (acl, data, respond) {
  // is he already part of this org?
  EntityMembership.find({
    entity_id: hashids.decode(data.orgId)[0],
    member_id: hashids.decode(data.currentPersonId)[0]
  }, function (err, result) {
    if (err) { return respond(err); }

    if (result.length > 0) {
      // already a member, not allowed to request membership
      respond(null, false);
    } else {
      // not a member, thus he is allowed
      respond(null, true);
    }
  });
});

ACL.allow('reportEntity', 'entities', 'Person', function (acl, data, respond) {
  // data = {
  //   currentEntityId,
  //   currentPersonId
  // }
  var d = {
    currentEntityId: hashids.decode(data.currentEntityId)[0],
    currentPersonId: hashids.decode(data.currentPersonId)[0]
  }

  // check if user is trying to report itself
  if (d.currentEntityId === d.currentPersonId) {
    return respond(new ForbiddenError('Cannot report yourself'));
  }

  // check if user has already reported this
  Report.find({
    reported_id: d.currentEntityId,
    reporter_id: d.currentPersonId
  }, function (err, result) {
    if (err) { return respond(err); }

    if (result.length > 0) {
      return respond(null, { isAllowed: false, status: { status: 'reported' } });
    }

    return respond(null, { isAllowed: true });
  });
});

// PostsController

ACL.allow(['savePost', 'unsavePost'], 'posts', 'Person', function(acl, data, next) {
  var entity = new Entity(data.currentPerson);

  entity.id = hashids.decode(entity.id)[0];

  return next(null, { isAllowed : true, person : entity });
});
