'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('VoiceTopic', function(t) {
      t.increments('id').primary();
      t.integer('voice_id').index().notNullable();
      t.integer('topic_id').index().notNullable();
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('VoiceTopic')
  ]);
};
