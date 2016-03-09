
exports.up = function(knex, Promise) {
  return knex
    .schema.table('Notifications', function (t) {
      t.boolean('for_feed').index();
    }).then(function () {
      return knex('Notifications').update('for_feed', true);
    }).then(function () {
      return knex('Notifications').update('read', true);
    });
};

exports.down = function(knex, Promise) {
  return knex
    .schema.table('Notifications', function (t) {
      t.dropColumn('for_feed');
    })
    .then(function () {
      return knex('FeedActions')
        .where('item_type', '=', 'message')
        .del()
    });
};
