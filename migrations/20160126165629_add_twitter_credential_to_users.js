
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Users', function(t) {
      t.json('twitter_credentials').defaultTo(null);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Users', function(t) {
      t.dropColumn('twitter_credentials');
    })
  ]);
};
