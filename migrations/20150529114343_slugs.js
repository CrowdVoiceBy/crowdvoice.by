'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Slugs', function (t) {
      t.increments('id').primary();
      t.integer('voice_id').defaultTo(0).index();
      t.string('url', 512).unique().defaultTo(null).index();
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('Slugs')
  ]);
};
