'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('InvitationRequest', function (t) {
      t.increments('id').primary();

      t.integer('invitator_entity_id').defaultTo(0).index();
      t.integer('invited_entity_id').defaultTo(0).index();
      t.index(['invitator_entity_id', 'invited_entity_id'], 'invitator_invited_index');
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('InvitationRequest')
  ]);
};
