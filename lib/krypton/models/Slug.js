K.Slug = Class(K, 'Slug').inherits(Krypton.Model)({
  tableName: 'Slugs',

  attributes: [
    'id',
    'voiceId',
    'url',
    'createdAt',
    'updatedAt'
  ],

  validations: {}
})

module.exports = new K.Slug()
