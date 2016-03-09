
exports.up = function(knex, Promise) {
  return knex('ReadablePosts').del();
};

exports.down = function(knex, Promise) {
  return knex('ReadablePosts').del();
};
