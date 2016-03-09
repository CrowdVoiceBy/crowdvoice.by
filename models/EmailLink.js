var EmailLink = Class('EmailLink').inherits(Argon.KnexModel)({

  validations: {
    emailUuid: ['required'],
    entityId: ['required'],
  },

  storage: (new Argon.Storage.Knex({
    tableName: 'EmailLinks',
  })),

  prototype: {
    emailUuid: null,
    entityId: null,
  },

})

module.exports = EmailLink
