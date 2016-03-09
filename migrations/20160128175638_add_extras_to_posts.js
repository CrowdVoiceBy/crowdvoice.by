
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Posts', function(t) {
      t.json('extras').defaultTo('{}');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Posts', function(t) {
      t.dropColumn('extras');
    })
  ]);
};
