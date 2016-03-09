K.EntityMembership = Class(K, 'EntityMembership').inherits(Krypton.Model)({
  tableName: 'EntityMembership',

  attributes: [
    'id',
    'entityId',
    'memberId',
    'createdAt',
    'updatedAt',
    'isAnonymous'
  ],

  validations: {
    entityId: ['required'],
    memberId: ['required']
  },

  prototype: {
    isAnonymous: false
  }
})

module.exports = new K.EntityMembership()
