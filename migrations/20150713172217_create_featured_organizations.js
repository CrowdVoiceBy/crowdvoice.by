
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.createTable('FeaturedOrganizations', function (t) {
      t.increments('id').primary();
      t.integer('entity_id').defaultTo(0).index();
      t.integer('position').defaultTo(0).index();
      t.timestamps();
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('FeaturedOrganizations')
  ]);
};
