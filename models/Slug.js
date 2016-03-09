var Slug = Class('Slug').inherits(Argon.KnexModel)({

  validations : {},

  storage : (new Argon.Storage.Knex({
    tableName : 'Slugs'
  })),

  prototype : {
    voice : function voice (done) {
      Voice.find({id: this.voiceId}, function (err, voices) {
        if (voices.length === 0) { return done(new NotFoundError('Voice not found')); }

        if (voices[0].deleted) {
          return done(new NotFoundError('Voice not found'));
        }

        done(err, new Voice(voices[0]));
      });
    }
  }
});

module.exports = Slug;
