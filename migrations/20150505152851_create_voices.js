'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Voices', function(t) {
      t.increments('id').primary();
      t.string('title', 512).defaultTo(null);
      t.text('description').defaultTo(null);
      t.integer('owner_id').index().defaultTo(0);
      t.string('status').index().notNullable();
      t.string('type').index().notNullable();

      // Image attachment
      t.string('image_base_url', 1024).defaultTo('');
      t.json('image_meta').defaultTo('{}');

      t.string('latitude').defaultTo(null);
      t.string('longitude').defaultTo(null);
      t.string('location_name').defaultTo(null);
      t.string('twitter_search', 512).defaultTo(null);
      t.dateTime('tweet_last_fetch_at').defaultTo(null);
      t.string('rss_url', 512).defaultTo(null);
      t.dateTime('rss_last_fetch_at').defaultTo(null);
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('Voices')
  ]);
};
