
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Posts', function(t) {
      t.string('favicon_base_url', 1024).defaultTo('');
      t.json('favicon_meta').defaultTo('{}');
      t.string('source_domain', 128).defaultTo(null);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.table('Posts', function(t) {
      t.dropColumn('favicon_base_url');
      t.dropColumn('favicon_meta');
      t.dropColumn('source_domain');
    })
  ]);
};
