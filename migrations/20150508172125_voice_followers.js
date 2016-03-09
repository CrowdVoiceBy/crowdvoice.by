'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('VoiceFollowers', function (t) {
      t.increments('id').primary();

      t.integer('entity_id').defaultTo(0).index();
      t.integer('voice_id').defaultTo(0).index();
      t.index(['entity_id', 'voice_id'], 'entity_voice_index');
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('VoiceFollowers')
  ]);
};
