'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Posts', function(t) {
      t.increments('id').primary();
      t.string('title', 512).defaultTo(null);
      t.text('description').defaultTo(null);
      t.integer('owner_id').index().notNullable();
      t.integer('voice_id').index().notNullable();
      t.boolean('approved').index();

      // Image attachment
      t.string('image_base_url', 1024).defaultTo('');
      t.json('image_meta').defaultTo('{}');

      t.string('source_service').notNullable();
      t.string('source_type').notNullable();
      t.string('source_url', 1024).defaultTo(null).unique();
      t.dateTime('published_at').index();
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('Posts')
  ]);
};
