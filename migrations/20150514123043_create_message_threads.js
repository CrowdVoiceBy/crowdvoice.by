'use strict';

exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('MessageThreads', function(t) {
      t.increments('id').primary();
      t.integer('sender_person_id').notNullable();
      t.integer('sender_entity_id').notNullable();
      t.integer('receiver_entity_id').notNullable();
      t.boolean('hidden_for_sender').defaultTo(false);
      t.boolean('hidden_for_receiver').defaultTo(false);
      t.dateTime('last_seen_sender').defaultTo(null);
      t.dateTime('last_seen_receiver').defaultTo(null);
      t.integer('message_count_sender').defaultTo(0);
      t.integer('message_count_receiver').defaultTo(0);
      t.index(['sender_person_id', 'sender_entity_id', 'receiver_entity_id'], 'participants_index');
      t.timestamps();
    })
  ])
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('MessageThreads')
  ]);
};
