K.VoiceTopic = Class(K, 'VoiceTopic').inherits(Krypton.Model)({
  tableName: 'VoiceTopic',

  attributes: [
    'id',
    'voiceId',
    'topicId',
    'createdAt',
    'updatedAt'
  ],

  validations: {}
})

module.exports = new K.VoiceTopic()
