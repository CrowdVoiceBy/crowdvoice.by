
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('VoiceCollaborator', function (t) {
      t.increments('id').primary();
      t.integer('voice_id').defaultTo(0).index();
      t.integer('collaborator_id').defaultTo(0).index();
      t.boolean('is_anonymous').defaultTo(false);
      t.index(['voice_id', 'collaborator_id'], 'voice_collaborators');
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('VoiceCollaborator')
  ]);
};
