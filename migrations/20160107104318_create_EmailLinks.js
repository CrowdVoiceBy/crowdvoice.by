
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('EmailLinks', function (t) {
    t.increments('id').primary()
    t.uuid('email_uuid').index()
    t.integer('entity_id')
    t.timestamps()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('EmailLinks')
};
