
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('FeedActions', function (t) {
      t.increments('id').primary();
      t.string('item_type').index();
      t.integer('item_id').index();
      t.string('action').index();
      t.integer('who').index(); // entity ID
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('FeedActions')
  ]);
};
