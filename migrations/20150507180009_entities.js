'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Entities', function (t) {
      t.increments('id').primary();

      t.string('type', 32).defaultTo("person").index();
      t.string('name', 512).defaultTo(null);
      t.string('lastname', 512).defaultTo(null);
      t.string('profile_name', 512).unique().defaultTo(null);
      t.boolean('is_anonymous').defaultTo(false);
      t.boolean('is_admin').defaultTo(false);

      t.text('description').defaultTo(null);
      t.string('location', 512).defaultTo(null);

      // Image attachment
      t.string('image_base_url', 1024).defaultTo(null);
      t.json('image_meta').defaultTo('{}');

      // Background attachment
      t.string('background_base_url', 1024).defaultTo(null);
      t.json('background_meta').defaultTo('{}');

      t.index(['name', 'lastname', 'profile_name'], 'search_index');
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('Entities')
  ]);
};
