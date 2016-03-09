var FeaturedVoice = Class('FeaturedVoice').inherits(Argon.KnexModel)({

  validations : {
    voiceId : ['required'],
    position : ['required']
  },

  storage : (new Argon.Storage.Knex({
    tableName : 'FeaturedVoices'
  })),

  prototype : {
    voiceId : null,
    position : null
  }
});

module.exports = FeaturedVoice;
