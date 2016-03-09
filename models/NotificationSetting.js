var NotificationSetting = Class('NotificationSetting').inherits(Argon.KnexModel)({
  validations: {
    entityId: ['required'],
    webSettings: ['required'],
    emailSettings: ['required'],
  },

  storage: (new Argon.Storage.Knex({
    tableName: 'NotificationSettings',
  })),

  prototype: {
    entityId: null,
    webSettings: null,
    emailSettings: null,
  },
})

module.exports = new NotificationSetting()
