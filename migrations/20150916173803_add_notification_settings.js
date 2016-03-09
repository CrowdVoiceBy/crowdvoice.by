var async = require('async');

exports.up = function(knex, Promise) {
  return Promise.all([
    // create table
    knex.schema.createTable('NotificationSettings', function (t) {
      t.increments('id').primary();
      t.integer('entity_id').index();
      t.json('web_settings');
      t.json('email_settings');
      t.timestamps();
    }),

    // create rows for existing users
    knex.select('*').from('Entities').where('is_anonymous', '=', false)
      .then(function (entities) {
        var ids = entities.map(function (entity) { return entity.id; }),
          records = [],
          nowDate,
          defaultSettings = {
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
            voiceNewPublicContributor: true,
          };

        ids.forEach(function (id) {
          nowDate = new Date();

          records.push({
            entity_id: id,
            web_settings: defaultSettings,
            email_settings: defaultSettings,
            created_at: nowDate,
            updated_at: nowDate,
          });
        });

        return knex.insert(records).into('NotificationSettings');
      })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('NotificationSettings')
  ]);
};
