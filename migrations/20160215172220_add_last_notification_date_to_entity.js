
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Entities', function(t) {
      t.timestamp('last_notification_date').defaultTo(null);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Entities', function (t) {
      t.dropColumn('last_notification_date');
    })
  ]);
};
