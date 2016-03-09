
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('ScrapperErrors', function (t) {
      t.increments('id').primary();
      t.text('url').index();
      t.json('error');
      t.text('error_stack');
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('ScrapperErrors')
  ]);
};
