var RelatedVoice = Class('RelatedVoice').inherits(Argon.KnexModel)({

  validations : {
    voiceId : ['required'],
    relatedId : ['required']
  },

  storage : (new Argon.Storage.Knex({
    tableName : 'RelatedVoices'
  })),

  prototype : {
    voiceId : null,
    relatedId : null
  }
});

module.exports = RelatedVoice;
