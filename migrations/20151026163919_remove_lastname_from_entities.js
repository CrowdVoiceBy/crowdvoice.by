
exports.up = function(knex, Promise) {
  knex.schema.table('Entities', function(table) {
    table.dropColumn('lastname');
  })
};

exports.down = function(knex, Promise) {
  knex.schema.table('Entities', function(table) {
    table.string('lastname', 512).defaultTo(null);
  })
};
