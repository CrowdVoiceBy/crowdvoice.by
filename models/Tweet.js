var Tweet = Class('Tweet').inherits(Argon.KnexModel)({

  validations : {
    voiceId : ['required'],
    idStr : ['required'],
    text : ['required']
  },

  storage : (new Argon.Storage.Knex({
    tableName : 'Tweets'
  })),

  prototype : {
    voiceId : null,
    idStr : null,
    text : null
  }
});

module.exports = Tweet;
