
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Messages', function (t) {
      t.integer('report_id').index();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Messages', function (t) {
      t.dropColumn('report_id');
    })
  ]);
};
