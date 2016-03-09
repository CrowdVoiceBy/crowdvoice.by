
exports.up = function(knex, Promise) {
  return knex.schema.table('HomepageTopVoices', function (t) {
    t.uuid('video_uuid').index()
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table('HomepageTopVoices', function (t) {
    t.dropColumn('video_uuid')
  })
};
