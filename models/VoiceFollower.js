var VoiceFollower = Class('VoiceFollower').inherits(Argon.KnexModel)({

  validations : {},

  storage : (new Argon.Storage.Knex({
    tableName : 'VoiceFollowers'
  })),
  
  prototype : {

  }
});

module.exports = VoiceFollower;
