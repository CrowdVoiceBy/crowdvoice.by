
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Entities', function (t) {
      t.boolean('deleted').defaultTo(false);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Entities', function (t) {
      t.dropColumn('deleted');
    })
  ]);
  knex.schema
};