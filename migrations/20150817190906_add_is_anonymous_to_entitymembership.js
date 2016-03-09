
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('EntityMembership', function (t) {
      t.boolean('is_anonymous').defaultTo(false);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('EntityMembership', function (t) {
      t.dropColumn('is_anonymous');
    })
  ]);
  knex.schema
};
