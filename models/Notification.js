var Notification = Class('Notification').inherits(Argon.KnexModel)({
  validations: {
    actionId: ['required'],
    followerId: ['required'],
    read: ['required'],
    forFeed: ['required'],
  },

  storage: (new Argon.Storage.Knex({
    tableName: 'Notifications',
  })),

  prototype: {
    // ID of action so we may make a relation
    actionId: null,
    // who is following
    followerId: null,
    // whether the followerId has read the notification or not
    read: null,
    // whether it should be displayed in the feed (true) or notifications (false)
    forFeed: null,
  },
})

module.exports = new Notification()
