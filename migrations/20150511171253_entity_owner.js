'use strict';

exports.up = function(knex, Promise) {
 return Promise.all([
    knex.schema.createTable('EntityOwner', function (t) {
      t.increments('id').primary();

      t.integer('owner_id').defaultTo(0).index();
      t.integer('owned_id').defaultTo(0).index();
      t.index(['owner_id', 'owned_id'], 'owner_owned_id');
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('EntityOwner')
  ]);
};
