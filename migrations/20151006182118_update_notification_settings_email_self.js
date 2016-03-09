var _ = require('underscore'),
  async = require('async');

exports.up = function(knex, Promise) {
  return knex.select('*').from('NotificationSettings')
    .then(function (settings) {
      return Promise.all(settings.map(function (row) {
        return knex('NotificationSettings')
          .update({
            email_settings: _.defaults(row.email_settings, {
              selfNewMessage: true,
              selfNewInvitation: true,
              selfNewRequest: true,
              selfNewVoiceFollower: true,
              selfNewEntityFollower: true
            }),
            updated_at: new Date()
          })
          .where('id', '=', row.id)
      }));
    });
};

exports.down = function(knex, Promise) {
  return knex.select('*').from('NotificationSettings')
    .then(function (settings) {
      return Promise.all(settings.map(function (row) {
        var email = row.email_settings;

        delete email.selfNewMessage;
        delete email.selfNewInvitation;
        delete email.selfNewRequest;
        delete email.selfNewVoiceFollower;
        delete email.selfNewEntityFollower;

        return knex('NotificationSettings')
          .update({
            email_settings: email,
            updated_at: new Date()
          })
          .where('id', '=', row.id)
      }));
    });
};
