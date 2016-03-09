
exports.up = function(knex, Promise) {
  return knex.schema.table('MessageThreads', function (t) {
    t.dropColumn('message_count_sender');
    t.dropColumn('message_count_receiver');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('MessageThreads', function (t) {
    t.integer('message_count_sender').defaultTo(0);
    t.integer('message_count_receiver').defaultTo(0);
  })
};
