
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Posts', function(t) {
      t.string('favicon_path', 1024).defaultTo(null);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Posts', function(t) {
      t.dropColumn('favicon_path');
    })
  ]);
};
