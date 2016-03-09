'use strict'

var FeedPresenter = require('./FeedPresenter.js')

var NotificationsPresenter = Module('NotificationsPresenter')({
  build: function (notifications, currentPerson, callback) {
    var result = []

    async.eachLimit(notifications, 1, function (notification, nextNotif) {
      FeedAction.find({ id: notification.actionId }, function (err, action) {
        if (err) { return nextNotif(err) }

        FeedPresenter.build(action, currentPerson, function (err, pres) {
          if (err) { return nextNotif(err) }

          result.push({
            notificationId: hashids.encode(notification.id),
            action: pres[0],
            read: notification.read,
          })

          return nextNotif()
        })
      })
    }, function (err) {
      if (err) { return callback(err) }

      return callback(null, result)
    })
  },
})

module.exports = NotificationsPresenter
