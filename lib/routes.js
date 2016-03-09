var router = application.router;

// HomeController
router.route('/')
  .get(HomeController.prototype.index);

// NotificationSettingsController
router.route('/deactivateEmailSetting')
  .get(NotificationSettingsController.prototype.filterAction(NotificationSettingsController, 'deactivateEmailSetting'));

// PagesController
router.route('/page/about')
  .get(PagesController.prototype.about);

// EmbedController
router.route('/embed/:profileName/:voice_slug*')
  .all(VoicesController.prototype.getActiveVoice);
router.route('/embed/:profileName/:voice_slug')
  .get(EmbedController.prototype.voice);

// Browse
router.route('/browse/featured/voices')
  .get(BrowseController.prototype.featuredVoices);
router.route('/browse/featured/people')
  .get(BrowseController.prototype.featuredPeople);
router.route('/browse/featured/organizations')
  .get(BrowseController.prototype.featuredOrganizations);

// Topics
router.route('/topics*')
  .all(TopicsController.prototype.populateLocals);
router.route('/topics')
  .get(TopicsController.prototype.index);
router.route('/topic/:topicSlug')
  .get(TopicsController.prototype.getTopicBySlug);
router.route('/topic/:topicSlug/people')
  .get(TopicsController.prototype.people);
router.route('/topic/:topicSlug/organizations')
  .get(TopicsController.prototype.organizations);
router.route('/topic/:topicSlug/newestVoices')
  .get(TopicsController.prototype.newestVoices);

router.route('/voice')
  .post(VoicesController.prototype.create);

router.route('/login')
  .get(SessionsController.prototype.login);
router.route('/session/forgot-password')
  .get(SessionsController.prototype.forgotPassword)
  .post(SessionsController.prototype.forgotPassword);
router.route('/session')
  .post(SessionsController.prototype.create);
router.route('/session/reset-password')
  .post(SessionsController.prototype.resetPassword);
router.route('/session')
  .get(SessionsController.prototype.tokenAuth);
router.route('/logout')
  .get(SessionsController.prototype.logout);

router.route('/switchPerson')
  .get(SessionsController.prototype.switchPerson);

// UsersController
router.route('/user')
  .post(UsersController.prototype.create);
router.route('/signup')
  .get(UsersController.prototype.new);
router.route('/signup/isProfileNameAvailable')
  .post(HomeController.prototype.signupIsProfileNameAvailable);

// Discover

// index new
router.route('/discover/new')
  .get(DiscoverController.prototype.newIndex);
// new
router.route('/discover/new/voices')
  .get(DiscoverController.prototype.newVoices);
router.route('/discover/new/people')
  .get(DiscoverController.prototype.newPeople);
router.route('/discover/new/organizations')
  .get(DiscoverController.prototype.newOrganizations);
// index trending
router.route('/discover/trending')
  .get(DiscoverController.prototype.trendingIndex);
// trending
router.route('/discover/trending/voices')
  .get(DiscoverController.prototype.trendingVoices);
router.route('/discover/trending/people')
  .get(DiscoverController.prototype.trendingPeople);
router.route('/discover/trending/organizations')
  .get(DiscoverController.prototype.trendingOrganizations);
router.route('/discover/trending/updatedVoices')
  .get(DiscoverController.prototype.updatedVoices);

// index recommended
router.route('/discover/recommended')
  .get(DiscoverController.prototype.recommendedIndex);

// index recommended
router.route('/discover/browse')
  .get(DiscoverController.prototype.browseIndex);

// SearchController
router.route('/search/:query')
  .get(SearchController.prototype.index);

router.route('/search/voices')
  .post(SearchController.prototype.searchVoices);

router.route('/search/people')
  .post(SearchController.prototype.searchPeople);

router.route('/search/organizations')
  .post(SearchController.prototype.searchOrganizations);

// AdminController
router.route('/admin')
  .get(Admin.AdminController.prototype.index);

/**
 * Homepage's Top Voices
 */

router.route('/admin/topVoices')
  .get(Admin.HomepageTopVoicesController.prototype.index)
  .post(Admin.HomepageTopVoicesController.prototype.create);

router.route('/admin/topVoices/:topVoiceId')
  .put(Admin.HomepageTopVoicesController.prototype.update)
  .delete(Admin.HomepageTopVoicesController.prototype.destroy);

/*
 * Featured Voices
 */

router.route('/admin/featured/voices')
  .get(Admin.FeaturedVoicesController.prototype.index);

router.route('/admin/featured/voices/new')
  .get(Admin.FeaturedVoicesController.prototype.new)
  .post(Admin.FeaturedVoicesController.prototype.create);

router.route('/admin/featured/voices/updatePositions')
  .post(Admin.FeaturedVoicesController.prototype.updatePositions);

router.route('/admin/featured/voices/search')
  .post(SearchController.prototype.searchVoices);

router.route('/admin/featured/voices/:voiceId*')
  .get(Admin.FeaturedVoicesController.prototype.getVoice);

router.route('/admin/featured/voices/:voiceId')
  .get(Admin.FeaturedVoicesController.prototype.show)
  .delete(Admin.FeaturedVoicesController.prototype.destroy);

// 404
router.route('/admin/featured/voices/:voiceId/edit')
  .get(Admin.FeaturedVoicesController.prototype.edit)
  .put(Admin.FeaturedVoicesController.prototype.update);

/*
 * Featured People/Organizations (Entities)
 */

router.route('/admin/featured/:entityType')
  .get(Admin.FeaturedEntitiesController.prototype.index);

router.route('/admin/featured/:entityType/new')
  .get(Admin.FeaturedEntitiesController.prototype.new)
  .post(Admin.FeaturedEntitiesController.prototype.create);

router.route('/admin/featured/:entityType/updatePositions')
  .post(Admin.FeaturedEntitiesController.prototype.updatePositions);

router.route('/admin/featured/:entityType/search')
  .post(Admin.FeaturedEntitiesController.prototype.searchEntities);

router.route('/admin/featured/:entityType/:entityId*')
  .get(Admin.FeaturedEntitiesController.prototype.getEntity);

router.route('/admin/featured/:entityType/:entityId')
  .get(Admin.FeaturedEntitiesController.prototype.show)
  .delete(Admin.FeaturedEntitiesController.prototype.destroy);

// 404
router.route('/admin/featured/:entityType/:entityId/edit')
  .get(Admin.FeaturedEntitiesController.prototype.edit)
  .put(Admin.FeaturedEntitiesController.prototype.update);

// people
router.route('/admin/people*')
  .all(Admin.PeopleController.prototype.setType);

router.route('/admin/people/')
  .get(Admin.PeopleController.prototype.index);

router.route('/admin/people/:entityId')
  .get(Admin.PeopleController.prototype.show);

router.route('/admin/people/:entityId/edit')
  .get(Admin.PeopleController.prototype.edit);

router.route('/admin/people/:entityId')
  .put(Admin.PeopleController.prototype.update);

router.route('/admin/people/:entityId')
  .delete(Admin.PeopleController.prototype.destroy);

// organizations
router.route('/admin/organizations*')
  .all(Admin.OrganizationsController.prototype.setType);

router.route('/admin/organizations/')
  .get(Admin.PeopleController.prototype.index);

router.route('/admin/organizations/:entityId')
  .get(Admin.OrganizationsController.prototype.show);

router.route('/admin/organizations/:entityId/edit')
  .get(Admin.OrganizationsController.prototype.edit);

router.route('/admin/organizations/:entityId')
  .put(Admin.OrganizationsController.prototype.update);

router.route('/admin/organizations/:entityId')
  .delete(Admin.OrganizationsController.prototype.destroy);

// Users
router.route('/admin/users/')
  .get(Admin.UsersController.prototype.index);

router.route('/admin/users/:userId')
  .get(Admin.UsersController.prototype.show);

router.route('/admin/users/:userId/edit')
  .get(Admin.UsersController.prototype.edit);

router.route('/admin/users/:userId')
  .put(Admin.UsersController.prototype.update);

router.route('/admin/users/:userId')
  .delete(Admin.UsersController.prototype.destroy);

// Voices
router.route('/admin/voices/')
  .get(Admin.VoicesController.prototype.index);

router.route('/admin/voices/:voiceId')
  .get(Admin.VoicesController.prototype.show);

router.route('/admin/voices/:voiceId/edit')
  .get(Admin.VoicesController.prototype.edit);

router.route('/admin/voices/:voiceId')
  .put(Admin.VoicesController.prototype.update);

router.route('/admin/voices/:voiceId')
  .delete(Admin.VoicesController.prototype.destroy);

// Topics
router.route('/admin/topics')
  .get(Admin.TopicsController.prototype.index);

router.route('/admin/topics/:topicId')
  .get(Admin.TopicsController.prototype.show);

router.route('/admin/topics/:topicId/edit')
  .get(Admin.TopicsController.prototype.edit);

router.route('/admin/topics/:topicId')
  .put(Admin.TopicsController.prototype.update);

router.route('/admin/topics/:topicId')
  .delete(Admin.TopicsController.prototype.destroy);

// HANDLING OF /anonymous/* AND /anonymous_*/*
router.route(/^\/anonymous(_\w+)?([\/\w\-%]+)*(\/?#.+)?(\/?\?.+)?$/)
  .get(function (req, res, next) {
    var p = req.params,
      redirectUrl = '/anonymous',
      extras = '',
      queryString = false,
      split;

    if (req.query.noAnonFilter) {
      return next();
    }

    // /anonymous
    if (p[0] === undefined
      && p[1] === undefined
      || req.url === '/anonymous'
      || req.url === '/anonymous/') {

      return next(new NotFoundError());
    }

    // # and /#
    if (p[2]) {
      extras += p[2].match(/\#.*/)[0];
    }

    // query string
    if (p[3]) {
      queryString = true;
      extras += p[3].match(/\?.*/)[0];
    }

    // /anonymous_*/*
    if (p[0] && p[1]) {
      split = p[1].split('/');
      if (split.length > 2 && split[2] !== '') {
        //return res.redirect(redirectUrl + p[0] + p[1] + extras + (queryString ? '&' : '?') + 'noAnonFilter=1');
        return next();
      }
      return res.redirect(redirectUrl + p[1] + extras);
    }

    // /anonymous/*
    // At this point, everything has gone well and we should redirect to the
    // voice.
    if (p[0] === undefined && p[1]) {
      return next();
    }
  });

// open the auth modal
router.route('/twitter/open')
    .get(SearchFrom.prototype.twitterOpen);


// Authorize Twitter Callback
router.route('/twitter/oauth')
    .get(SearchFrom.prototype.authorizeTwitter);

// Twitter Callback
router.route('/twitter/callback')
    .get(SearchFrom.prototype.twitterCallback);

// Twitter Credentials
router.route('/twitter/hasTwitterCredentials')
    .get(SearchFrom.prototype.hasTwitterCredentials);

// EntitiesController
router.route('/:profile_name*')
  .all(EntitiesController.prototype.filterAction(EntitiesController, 'getEntityByProfileName'));

router.route('/:profile_name')
  .get(EntitiesController.prototype.filterAction(EntitiesController, 'show'));
router.route('/:profile_name')
  .put(EntitiesController.prototype.filterAction(EntitiesController, 'update'));

router.route('/:profile_name/updateUser')
  .put(EntitiesController.prototype.filterAction(EntitiesController, 'updateUser'));

router.route('/:profile_name/edit')
  .get(EntitiesController.prototype.filterAction(EntitiesController, 'edit'));
router.route('/:profile_name/edit/getOrganizations')
  .get(PeopleController.prototype.filterAction(PeopleController, 'getOrganizations'));
router.route('/:profileName/edit/updateNotificationSettings')
  .put(NotificationsController.prototype.updateNotificationSettings);

router.route('/:profile_name/follow')
  .post(EntitiesController.prototype.filterAction(EntitiesController, 'follow'));

router.route('/:profile_name/voices')
  .get(EntitiesController.prototype.filterAction(EntitiesController, 'voices'));

router.route('/:profileName/myVoices')
  .get(PeopleController.prototype.filterAction(PeopleController, 'myVoices'));

router.route('/:profileName/feed')
  .get(EntitiesController.prototype.filterAction(EntitiesController, 'feed'));

router.route('/:profileName/home')
  .get(EntitiesController.prototype.filterAction(EntitiesController, 'home'));

router.route('/:profile_name/followers')
  .get(EntitiesController.prototype.filterAction(EntitiesController, 'followers'));

router.route('/:profile_name/voicesFollowed')
 .get(EntitiesController.prototype.filterAction(EntitiesController, 'voicesFollowed'));

router.route('/:profile_name/entitiesFollowed')
 .get(EntitiesController.prototype.filterAction(EntitiesController, 'entitiesFollowed'));

router.route('/:profile_name/savedPosts')
  .get(PeopleController.prototype.filterAction(PeopleController, 'savedPosts'));
router.route('/:profile_name/recommended')
  .get(EntitiesController.prototype.filterAction(EntitiesController, 'recommended'));

router.route('/:profile_name/members')
  .get(OrganizationsController.prototype.filterAction(OrganizationsController, 'members'));

router.route('/:profileName/report')
  .post(EntitiesController.prototype.filterAction(EntitiesController, 'reportEntity'));

// OrganizationsController
router.route('/:profileName/removeEntity')
  .post(OrganizationsController.prototype.filterAction(OrganizationsController, 'removeEntity'));
router.route('/:profileName/leaveOrganization')
  .post(OrganizationsController.prototype.filterAction(OrganizationsController, 'leaveOrganization'));
router.route('/:profileName/requestMembership')
  .post(OrganizationsController.prototype.filterAction(OrganizationsController, 'requestMembership'));
router.route('/:profileName/newOrganization')
  .post(OrganizationsController.prototype.filterAction(OrganizationsController, 'create'));

// NotificationsController
router.route('/:profileName/notifications')
  .get(NotificationsController.prototype.getNotifications);
router.route('/:profileName/notifications/markAsRead')
  .delete(NotificationsController.prototype.markAsRead);
router.route('/:profileName/notifications/markAllAsRead')
  .delete(NotificationsController.prototype.markAllAsRead);

// ThreadsController
router.route('/:profileName/messages')
  .get(ThreadsController.prototype.filterAction(ThreadsController, 'index'))
  .post(ThreadsController.prototype.filterAction(ThreadsController, 'create'));

router.route('/:profileName/messages/searchPeople')
  .post(ThreadsController.prototype.filterAction(ThreadsController, 'searchPeople'));

router.route('/:profileName/messages/:threadId')
  .get(ThreadsController.prototype.filterAction(ThreadsController, 'index'))
  .post(MessagesController.prototype.filterAction(MessagesController, 'create'))
  .put(ThreadsController.prototype.filterAction(ThreadsController, 'update'))
  .delete(ThreadsController.prototype.filterAction(ThreadsController, 'destroy'));

router.route('/:profileName/isProfileNameAvailable')
  .post(EntitiesController.prototype.filterAction(EntitiesController, 'isProfileNameAvailable'));

router.route('/:profileName/isEmailAvailable')
  .post(EntitiesController.prototype.filterAction(EntitiesController, 'isEmailAvailable'));

router.route('/:profileName/isVoiceSlugAvailable')
  .post(EntitiesController.prototype.filterAction(EntitiesController, 'isVoiceSlugAvailable'));

// MessagesController
router.route('/:profileName/messages/:threadId/messages')
  .get(MessagesController.prototype.filterAction(MessagesController, 'getMessages'))
router.route('/:profileName/messages/:threadId/:messageId/answerInvite')
  .post(MessagesController.prototype.filterAction(MessagesController, 'answerInvite'));

// VoicesController
router.route('/:profileName/:voice_slug*')
  .all(VoicesController.prototype.filterAction(VoicesController, 'getActiveVoice'));

router.route('/:profileName/:voiceSlug/inviteToContribute')
  .post(VoicesController.prototype.filterAction(VoicesController, 'inviteToContribute'));
router.route('/:profileName/:voiceSlug/removeContributor')
  .post(VoicesController.prototype.filterAction(VoicesController, 'removeContributor'));

router.route('/:profileName/:voice_slug/edit')
  .get(VoicesController.prototype.filterAction(VoicesController, 'edit'));
router.route('/:profileName/:voice_slug')
  .get(VoicesController.prototype.filterAction(VoicesController, 'show'))
  .put(VoicesController.prototype.filterAction(VoicesController, 'update'))
  .delete(VoicesController.prototype.filterAction(VoicesController, 'fullDelete'))


router.route('/:profileName/:voiceSlug/requestToContribute')
  .post(VoicesController.prototype.filterAction(VoicesController, 'requestToContribute'));

router.route('/:profileName/:voiceSlug/follow')
  .post(VoicesController.prototype.filterAction(VoicesController, 'follow'));

router.route('/:profileName/:voiceSlug/isVoiceSlugAvailable')
  .post(VoicesController.prototype.filterAction(VoicesController, 'isVoiceSlugAvailable'));

router.route('/:profileName/:voice_slug/archive')
  .put(VoicesController.prototype.filterAction(VoicesController, 'archiveVoice'));

router.route('/:profileName/:voiceSlug/manageRelatedVoices')
  .post(VoicesController.prototype.filterAction(VoicesController, 'addRelatedVoice'))
  .delete(VoicesController.prototype.filterAction(VoicesController, 'removeRelatedVoice'));

// PostsController
router.route('/:profileName/:voice_slug/upload')
  .post(PostsController.prototype.filterAction(PostsController, 'upload'));
router.route('/:profileName/:voiceSlug/uploadPostImage')
  .post(PostsController.prototype.filterAction(PostsController, 'uploadPostImage'));

router.route('/posts')
  .get(PostsController.prototype.index)
router.route('/:profileName/:voiceSlug/')
  .post(PostsController.prototype.filterAction(PostsController, 'create'));

router.route('/:profileName/:voiceSlug/:postId')
  .get(PostsController.prototype.filterAction(PostsController, 'show'))
  .put(PostsController.prototype.filterAction(PostsController, 'update'))
  .delete(PostsController.prototype.filterAction(PostsController, 'destroy'));

router.route('/:profileName/:voiceSlug/:postId/vote/:upOrDown')
  .get(VotesController.prototype.filterAction(VotesController, 'vote'));

router.route('/:profileName/:voiceSlug/moderate/deleteOlderThan')
  .delete(PostsController.prototype.filterAction(PostsController, 'deleteOlderThan'));
router.route('/:profileName/:voiceSlug/moderate/deleteAllUnmoderated')
  .delete(PostsController.prototype.filterAction(PostsController, 'deleteAllUnmoderated'));

router.route('/:profileName/:voiceSlug/:postId/savePost')
  .post(PostsController.prototype.savePost)
router.route('/:profileName/:voiceSlug/:postId/unsavePost')
  .post(PostsController.prototype.unsavePost)

router.route('/:profileName/:voiceSlug/preview')
  .post(PostsController.prototype.filterAction(PostsController, 'preview'));

router.route('/:profileName/:voiceSlug/saveArticle')
  .post(PostsController.prototype.filterAction(PostsController, 'saveArticle'));

// SearchFromController
router.route('/:profileName/:voiceSlug/googleNews')
  .post(SearchFrom.prototype.google);

router.route('/:profileName/:voiceSlug/youtube')
  .post(SearchFrom.prototype.youtube);

// Aggregator Twitter Search
router.route('/:profileName/:voiceSlug/twitter')
    .post(SearchFrom.prototype.twitterSearch);
