
exports.up = function(knex, Promise) {
  return knex.schema.table('ReadablePosts', function (t) {
    t.boolean('readerable').index();
  })
  .then(function () {
    return knex('ReadablePosts').update('readerable', true)
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('ReadablePosts', function (t) {
    t.dropColumn('readerable');
  });
};
