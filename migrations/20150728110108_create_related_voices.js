
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('RelatedVoices', function (t) {
      t.increments('id').primary();
      t.integer('voice_id').notNullable();
      t.integer('related_id').notNullable();
      t.timestamps();

      t.index(['voice_id', 'related_id'], 'related_voice');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('RelatedVoices')
  ]);
};
