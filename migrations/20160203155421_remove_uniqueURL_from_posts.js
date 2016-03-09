
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Posts', function(t) {
      t.dropUnique('source_url');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Posts', function(t) {
      t.unique('source_url');
    })
  ]);
};
