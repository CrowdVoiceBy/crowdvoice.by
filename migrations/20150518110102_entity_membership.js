'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('EntityMembership', function (t) {
      t.increments('id').primary();

      t.integer('entity_id').defaultTo(0).index();
      t.integer('member_id').defaultTo(0).index();
      t.index(['entity_id', 'member_id'], 'entity_members');

      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('EntityMembership')
  ]);
};
