K.EntityOwner = Class(K, 'EntityOwner').inherits(Krypton.Model)({
  tableName: 'EntityOwner',

  attributes: [
    'id',
    'ownerId',
    'ownedId',
    'createdAt',
    'updatedAt',
  ],

  validations: {}
})

module.exports = new K.EntityOwner()

