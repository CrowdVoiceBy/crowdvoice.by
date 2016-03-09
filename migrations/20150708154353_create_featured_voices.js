
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('FeaturedVoices', function(t) {
      t.increments('id').primary();
      t.integer('voice_id').defaultTo(0).index();
      t.integer('position').defaultTo(0).index();
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('FeaturedVoices')
  ]);
};
