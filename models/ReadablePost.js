var ReadablePost = Class('ReadablePost').inherits(Argon.KnexModel)({
  validations: {
    post_id: ['required'],
    data: [],
    readerable: ['required'],
  },

  storage: (new Argon.Storage.Knex({
    tableName: 'ReadablePosts',
  })),

  prototype: {
    post_id: null,
    data: null,
    readerable: null,
  },
})

module.exports = new ReadablePost()
