
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Messages', function (t) {
      t.increments('id').primary();
      t.string('type').defaultTo('message').notNullable();
      t.integer('sender_person_id').defaultTo(0).notNullable();
      t.integer('sender_entity_id').defaultTo(0).notNullable();
      t.integer('receiver_entity_id').defaultTo(0).notNullable();
      t.integer('thread_id').defaultTo(0).notNullable().index();
      t.integer('invitation_request_id').defaultTo(null);
      t.integer('voice_id').defaultTo(null);
      t.integer('organization_id').defaultTo(null);
      t.text('message');
      t.boolean('hidden_for_sender').defaultTo(false);
      t.boolean('hidden_for_receiver').defaultTo(false);
      t.index(['sender_person_id', 'receiver_entity_id'], 'participants');

      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('Messages')
  ]);
};
