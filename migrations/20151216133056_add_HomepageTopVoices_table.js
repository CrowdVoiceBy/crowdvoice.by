
exports.up = function(knex, Promise) {
  return knex.schema.createTableIfNotExists('HomepageTopVoices', function (t) {
    t.increments('id').primary();
    t.integer('voice_id').index();
    t.string('video_path', 1024);
    t.string('source_text');
    t.string('source_url', 1024);
    t.string('poster_path', 1024);
    t.string('description');
    t.boolean('active').index();
    t.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('HomepageTopVoices');
};
