K.SavedPost = Class(K, 'SavedPost').inherits(Krypton.Model)({
  tableName: 'SavedPosts',

  attributes: [
    'id',
    'entityId',
    'postId',
    'createdAt',
    'updatedAt'
  ],

  validations: {
    entityId: ['required'],
    postId: ['required']
  }
})

module.exports = new K.SavedPost()
