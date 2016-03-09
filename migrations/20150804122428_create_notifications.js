
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('Notifications', function (t) {
      t.increments('id').primary();
      t.integer('action_id').index();
      t.integer('follower_id').index();
      t.boolean('read').index();
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('Notifications')
  ]);
};
