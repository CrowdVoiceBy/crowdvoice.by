'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('EntityFollower', function (t) {
      t.increments('id').primary();

      t.integer('follower_id').defaultTo(0).index();
      t.integer('followed_id').defaultTo(0).index();
      t.index(['follower_id', 'followed_id'], 'following_index');
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('EntityFollower')
  ]);
};
