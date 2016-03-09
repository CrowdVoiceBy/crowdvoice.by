
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Reports', function (t) {
      t.increments('id').primary();
      t.integer('reporter_id').index();
      t.integer('reported_id').index();
      t.string('verdict').defaultTo('nothing').index();
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('Reports')
  ]);
};
