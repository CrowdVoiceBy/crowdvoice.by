var Report = Class('Report').inherits(Argon.KnexModel)({
  validations: {
    reportedId: ['required'],
    reporterId: ['required'],
    verdict: [],
  },

  storage: (new Argon.Storage.Knex({
    tableName: 'Reports',
  })),

  prototype: {
    reportedId: null,
    reporterId: null,
    verdict: null,
  },
})

module.exports = new Report()
