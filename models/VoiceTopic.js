var VoiceTopic = Class('VoiceTopic').inherits(Argon.KnexModel)({

  validations : {},

  storage : (new Argon.Storage.Knex({
    tableName : 'VoiceTopic'
  })),

  prototype : {
    voiceId : null,
    topicId : null
  }
});

module.exports = VoiceTopic;
