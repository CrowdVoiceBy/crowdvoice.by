K.Vote = Class(K, 'Vote').inherits(Krypton.Model)({
  tableName: 'Votes',

  attributes: [
    'id',
    'value', // +1 or -1
    'postId',
    'entityId', // null Visitor, 0 Anon, otherwise K.Entity.id
    'ip',
    'createdAt',
    'updatedAt'
  ],

  validations: {
    value: ['required'],
    postId: ['required'],
    ip: ['required']
  }
})

module.exports = new K.Vote()
