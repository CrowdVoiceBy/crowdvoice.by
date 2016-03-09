
exports.up = function(knex, Promise) {
  return knex.select('*').from('NotificationSettings')
    .then(function (settings) {
      return Promise.all(settings.map(function (setting) {
        return knex('NotificationSettings')
          .update({
            web_settings: {
              selfNewMessage: true,
              selfNewInvitation: true,
              selfNewRequest: true,
              selfNewVoiceFollower: true,
              selfNewEntityFollower: true
            },
            email_settings: {
              selfNewMessage: true,
              selfNewInvitation: true,
              selfNewRequest: true,
              selfNewVoiceFollower: true,
              selfNewEntityFollower: true
            },
            updated_at: new Date()
          })
      }));
    });
};

exports.down = function(knex, Promise) {
  return knex.select('*').from('NotificationSettings')
    .then(function (settings) {
      return Promise.all(settings.map(function (setting) {
        return knex('NotificationSettings')
          .update({
            web_settings: {
              entityFollowsEntity: true,
              entityFollowsVoice: true,
              entityArchivesVoice: true,
              entityUpdatesAvatar: true,
              entityUpdatesBackground: true,
              entityBecomesOrgPublicMember: true,
              voiceIsPublished: true,
              voiceNewPosts: true,
              voiceNewTitle: true,
              voiceNewDescription: true,
              voiceNewPublicContributor: true
            },
            email_settings: {
              selfNewMessage: true,
              selfNewInvitation: true,
              selfNewRequest: true,
              selfNewVoiceFollower: true,
              selfNewEntityFollower: true
            },
            updated_at: new Date()
          })
      }));
    });
};
