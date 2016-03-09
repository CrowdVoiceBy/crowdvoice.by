
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Tweets', function(t) {
      t.increments('id').primary();
      t.integer('voice_id').notNullable().index();
      t.string('id_str').notNullable();
      t.text('text').notNullable();
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('Tweets')
  ]);
};
