'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Users', function(t) {
      t.increments('id').primary();

      t.integer('entity_id').defaultTo(0).index();
      t.string('username', 512).unique().defaultTo(null);
      t.string('email', 254).index().unique();
      t.string('encrypted_password', 512).defaultTo(null);
      t.string('token', 512).defaultTo(null).index();
      t.boolean('deleted').defaultTo(false);

      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('Users')
  ]);
};
