var FeaturedPerson = Class('FeaturedPerson').inherits(Argon.KnexModel)({
  validations: {
    entityId: ['required'],
    position: ['required'],
  },

  storage: (new Argon.Storage.Knex({
    tableName: 'FeaturedPeople',
  })),

  prototype: {
    entityId: null,
    position: null,
  },
})

module.exports = FeaturedPerson
