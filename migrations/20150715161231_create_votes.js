
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Votes', function (t) {
      t.increments('id').primary();
      t.integer('value').defaultTo(0).index();
      t.integer('post_id').defaultTo(0).index();
      t.integer('entity_id').defaultTo(0).index();
      t.string('ip').defaultTo(0).index();
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('Votes')
  ]);
};
