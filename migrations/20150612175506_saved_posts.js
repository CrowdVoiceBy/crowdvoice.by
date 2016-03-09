'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('SavedPosts', function (t) {
      t.increments('id').primary();
      t.integer('entity_id').defaultTo(0).index();
      t.integer('post_id').defaultTo(0).index();
      t.index(['entity_id', 'post_id'], 'entity_post_id');
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('SavedPosts')
  ]);
};
