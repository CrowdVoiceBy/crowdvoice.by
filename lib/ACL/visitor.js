ACL.addRole(new ACL.Role('Visitor'));

ACL.addResource(new ACL.Resource('admin'));
ACL.addResource(new ACL.Resource('admin.people'));
ACL.addResource(new ACL.Resource('admin.organizations'));
ACL.addResource(new ACL.Resource('admin.users'));
ACL.addResource(new ACL.Resource('admin.voices'));
ACL.addResource(new ACL.Resource('admin.topics'));
ACL.addResource(new ACL.Resource('admin.featuredVoices'));
ACL.addResource(new ACL.Resource('admin.featuredEntities'));
ACL.addResource(new ACL.Resource('admin.homepageTopVoices'));

ACL.addResource(new ACL.Resource('homepage'));
ACL.addResource(new ACL.Resource('signup'));
ACL.addResource(new ACL.Resource('login'));
ACL.addResource(new ACL.Resource('voices'));
ACL.addResource(new ACL.Resource('users'));
ACL.addResource(new ACL.Resource('entities'));
ACL.addResource(new ACL.Resource('notifications'));
ACL.addResource(new ACL.Resource('notificationSettings'));
ACL.addResource(new ACL.Resource('threads'));

ACL.allow('show', 'homepage', 'Visitor', function (acl, args, next) {
  return next(null, true);
});

ACL.allow('show', 'signup', 'Visitor', function (acl, args, next) {
  return next(null, true);
});

ACL.allow('show', 'login', 'Visitor', function (acl, args, next) {
  return next(null, true);
});

ACL.allow('browse', 'voices', 'Visitor', function (acl, args, next) {
  return next(null, true);
});

ACL.allow('trending', 'voices', 'Visitor', function (acl, args, next) {
  return next(null, true);
});

ACL.allow('new', 'voices', 'Visitor', function (acl, args, next) {
  return next(null, true);
});

ACL.allow('topics', 'voices', 'Visitor', function (acl, args, next) {
  return next(null, true);
});

ACL.allow(['new', 'create', 'checkUsername'], 'users', 'Visitor', function(acl, data, next) {
  if (data.currentPerson) {
    return next(null, false)
  }

  return next(null, true);
});

/* ====================
   PostController
   ====================
*/
ACL.addResource(new ACL.Resource('posts'));

ACL.allow('show', 'posts', 'Visitor', function(acl, data, next) {
  var entity = data.entity;
  var voice = data.voice;
  var post = data.post;

  if (entity.type === 'person') {
    User.find({entity_id : entity.id}, function(err, user) {
      if (err) {
        return next(err);
      }

      if (user.length === 0) {
        return next(new NotFoundError('User not found'))
      }

      user = new User(user[0]);

      if (user.deleted || entity.deleted) {
        return next(null, false);
      }

      if (voice.status !== Voice.STATUS_PUBLISHED) {
        return next(null, false);
      }

      return next(null, true);
    })
  }
});

// if voice is public then yes, otherwise no
ACL.allow(['upload', 'create', 'preview'], 'posts', 'Visitor', function(acl, data, next) {
  /* data = {
   *   currentPerson: Entity,
   *   activeVoice: Voice,
   *   voiceOwnerProfile: String,
   * }
   */

  var answer = {
    postOwner: new Entity({
      id: 0,
      name: 'Anonymous',
      type: 'person',
      profileName: 'anonymous_guest',
      isAnonymous: false
    }),
    isAllowed: false
  };

  if (data.activeVoice.type === Voice.TYPE_PUBLIC) {
    answer.isAllowed = true;
  }

  return next(null, answer);
});

ACL.allow(['update', 'destroy', 'savePost', 'unsavePost', 'deleteOlderThan', 'deleteAllUnmoderated'], 'posts', 'Visitor', function(acl, data, next) {
  return next(null, { isAllowed : false });
});

ACL.allow(['uploadPostImage'], 'posts', 'Visitor', function(acl, data, next) {
  return next(null, { isAllowed : true });
})

/* ====================
   VoicesController
   ====================
*/

ACL.allow(['manageRelatedVoices', 'inviteToContribute', 'removeContributor'], 'voices', 'Visitor', function (acl, data, next) {
  return next(null, { isAllowed: false });
});

ACL.allow('show', 'voices', 'Visitor', function(acl, data, next) {
  var voice = data.voice;

  var result = {
    isAllowed : true,
    allowPosting : true,
    allowPostEditing : false
  }

  if (voice.type === Voice.TYPE_CLOSED) {
    result.allowPosting = false
  }

  if (voice.status !== Voice.STATUS_PUBLISHED && voice.status !== Voice.STATUS_UNLISTED) {
    result.isAllowed = false
  }

  return next(null, result);
});

ACL.allow(['destroy', 'edit', 'create', 'update', 'isVoiceSlugAvailable', 'requestToContribute'], 'voices', 'Visitor', function(acl, data, next) {
  return next(null, { isAllowed : false });
});

ACL.allow('archiveVoice', 'voices', 'Visitor', function (acl, data, next) {
  return next(null, false);
});

/* ====================
   ThreadsController
   ====================
*/
ACL.allow('show', 'threads', 'Visitor', function (acl, args, next) {
  return next(null, false);
});

/* ENTITIES */

ACL.allow(['myVoices', 'getOrganizations'], 'entities', 'Visitor', function (acl, args, next) {
  // visitors are never allowed because they don't have an account to look at
  return next(null, { isAllowed: false });
});

ACL.allow('savedPosts', 'entities', 'Visitor', function(acl, args, next) {
  return next(null, {isAllowed : false });
});

ACL.allow(['home', 'getNotifications', 'feed'], 'entities', 'Visitor', function (acl, args, next) {
  // visitors are never allowed because they don't have an account to look at
  return next(null, { isAllowed: false });
});

ACL.allow(['isProfileNameAvailable', 'isEmailAvailable'], 'entities', 'Visitor', function(acl, data, next) {
  return next(null, { isAllowed : false });
});
ACL.allow('isVoiceSlugAvailable', 'entities', 'Visitor', function(acl, data, next) {
  return next(null, { isAllowed : true });
});

ACL.allow('edit', 'entities', 'Visitor', function(acl, data, next) {
  return next(null, { isAllowed : false });
});

ACL.allow(['update', 'updateNotificationSettings'], 'entities', 'Visitor', function(acl, data, next) {
  return next(null, { isAllowed : false });
});

ACL.allow('updateUser', 'entities', 'Visitor', function(acl, data, next) {
  return next(null, { isAllowed : false });
});

ACL.allow('removeEntityFromOrg', 'entities', 'Visitor', function (acl, data, next) {
  return next(null, { isAllowed: false });
});

ACL.allow('followAs', 'entities', 'Visitor', function (acl, data, next) {
  return next(null, { isAllowed: false});
});

ACL.allow('leaveOrganization', 'entities', 'Visitor', function (acl, data, next) {
  return next(null, false);
});

ACL.allow('requestMembership', 'entities', 'Visitor', function (acl, data, next) {
  return next(null, false);
});

ACL.allow('reportEntity', 'entities', 'Visitor', function (acl, data, next) {
  return next(null, false);
});

// AdminController
ACL.allow('index', 'admin', 'Visitor', function(acl, data, next) {
  return next(null, false);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.people', 'Visitor', function(acl, data, next) {
  return next(null, false);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.organizations', 'Visitor', function(acl, data, next) {
  return next(null, false);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.users', 'Visitor', function(acl, data, next) {
  return next(null, false);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.voices', 'Visitor', function(acl, data, next) {
  return next(null, false);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy'], 'admin.topics', 'Visitor', function(acl, data, next) {
  return next(null, false);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy', 'updatePositions', 'searchVoices'], 'admin.featuredVoices', 'Visitor', function(acl, data, next) {
  return next(null, false);
});

ACL.allow(['index', 'show', 'new', 'create', 'edit', 'update', 'destroy', 'updatePositions', 'searchEntities'], 'admin.featuredEntities', 'Visitor', function(acl, data, next) {
  return next(null, false);
});

// Organizations
ACL.allow('createOrganization', 'entities', 'Visitor', function (acl, data, next) {
  return next(null, false);
});

// Notifications

ACL.allow('markAsRead', 'notifications', 'Visitor', function (acl, data, next) {
  return next(null, false);
});

ACL.allow('markAllAsRead', 'notifications', 'Visitor', function (acl, data, next) {
  return next(null, false);
});

// Notification Settings
ACL.allow('deactivateEmailSetting', 'notificationSettings', 'Visitor', function (acl, data, next) {
  EmailLink.find({ email_uuid: data.queryString.u }, function (err, result) {
    if (err) { return next(err); }

    if (result.length < 1) {
      return next(null, false);
    }

    return next(null, true);
  });
});
