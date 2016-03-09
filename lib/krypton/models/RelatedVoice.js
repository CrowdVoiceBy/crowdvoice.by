K.RelatedVoice = Class(K, 'RelatedVoice').inherits(Krypton.Model)({
  tableName: 'RelatedVoices',

  attributes: [
    'id',
    'voiceId',
    'relatedId',
    'createdAt',
    'updatedAt'
  ],

  validations: {
    voiceId: ['required'],
    relatedId: ['required']
  }
})

module.exports = new K.RelatedVoice()
