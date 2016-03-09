var Vote = Class('Vote').inherits(Argon.KnexModel)({
  validations: {
    value: ['required'],
    postId: ['required'],
    entityId: [],
    ip: ['required'],
  },

  storage: (new Argon.Storage.Knex({
    tableName: 'Votes',
  })),

  prototype: {
    // +1 for an upvote
    // -1 for a downvote
    value: null,
    // The post we're {up,down}voting
    postId: null,
    // null for Visitor
    // 0 for Anonymous
    // otherwise currentPerson.id
    entityId: null,
    // The IP from which the vote was registered
    ip: null,
  },
})

module.exports = new Vote()
