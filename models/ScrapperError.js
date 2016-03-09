var ScrapperError = Class('ScrapperError').inherits(Argon.KnexModel)({

  validations: {
    url: ['required'],
    error: ['required'],
    errorStack: ['required'],
  },

  storage: (new Argon.Storage.Knex({
    tableName: 'ScrapperErrors',
  })),

  prototype: {
    url: null,
    error: null,
    errorStack: null,
  },

})

module.exports = ScrapperError
