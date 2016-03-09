var FeaturedVoice = Class('FeaturedOrganization').inherits(Argon.KnexModel)({
  validations: {
    entityId: ['required'],
    position: ['required'],
  },

  storage: (new Argon.Storage.Knex({
    tableName: 'FeaturedOrganizations',
  })),

  prototype: {
    entityId: null,
    position: null,
  },
})

module.exports = FeaturedVoice
