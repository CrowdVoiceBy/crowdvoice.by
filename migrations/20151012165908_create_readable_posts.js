
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('ReadablePosts', function(t) {
      t.increments('id').primary();
      t.integer('post_id').index()
        .notNullable()
        .references('id')
        .inTable('Posts')
        .onDelete('CASCADE');
      t.json('data').defaultTo('{}');
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('ReadablePosts')
  ]);
};
