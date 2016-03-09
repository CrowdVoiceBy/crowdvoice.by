
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Users', function(table) {
      table.dropColumn('username');
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Users', function(table) {
      table.string('username', 512).unique().defaultTo(null);
    })
  ]);
};
