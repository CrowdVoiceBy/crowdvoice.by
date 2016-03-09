'use strict'

var NotificationsPresenter = require(path.join(process.cwd(), 'presenters', 'NotificationsPresenter.js'))

var NotificationsController = Class('NotificationsController')({

  prototype: {

    getNotifications: function (req, res, next) {
      ACL.isAllowed('getNotifications', 'entities', req.role, {
        currentEntity: req.entity,
        currentPerson: req.currentPerson,
      }, function (err, response) {
        if (err) { return next(err) }

        if (!response.isAllowed) {
          return next(new ForbiddenError())
        }

        var currentPerson,
          person = new Entity(req.currentPerson)
        person.id = hashids.decode(person.id)[0]

        person.owner(function (err, result) {
          if (err) { return next(err) }

          if (req.currentPerson.isAnonymous) {
            currentPerson = new Entity(result)
          } else {
            currentPerson = new Entity(person)
          }

          EntityOwner.find({
            owner_id: currentPerson.id,
          }, function (err, entities) {
            if (err) { return next(err) }

            var ids = entities.map(function (owner) {
              return owner.ownedId
            })
            ids.push(currentPerson.id)

            return res.format({
              html: function () {
                db('Notifications')
                  .count('*')
                  .where('follower_id', 'in', ids)
                  .andWhere('for_feed', '=', false)
                  .then(function (count) {
                    res.locals.totalNotifications = +count[0].count

                    return res.render('people/notifications')
                  })
                  .catch(next)
              },

              json: function () {
                db('Notifications')
                  .select('*', function () {
                    return this
                      .count('*')
                      .as('full_count')
                      .from('Notifications')
                      .where('follower_id', 'in', ids)
                      .andWhere('for_feed', '=', false)
                  })
                  .where('follower_id', 'in', ids)
                  .andWhere('for_feed', '=', false)
                  .orderBy('created_at', 'desc')
                  .offset(req.query.offset || 0)
                  .limit(req.query.limit || 50)
                  .asCallback(function (err, result) {
                    if (err) { return next(err) }

                    var notifications = Argon.Storage.Knex.processors[0](result)

                    NotificationsPresenter.build(notifications, req.currentPerson, function (err, presentedNotifications) {
                      if (err) { return next(err) }

                      return res.json({
                        notifications: presentedNotifications,
                        totalCount: (result[0] ? +result[0].full_count : 0),
                      })
                    })
                  })
              },
            })
          })
        })
      })
    },

    markAsRead: function (req, res, next) {
      /* DELETE
       * req.body = {
       *   notificationId: Hashids.encode result,
       * }
       */

      ACL.isAllowed('markAsRead', 'notifications', req.role, {
        currentPerson: req.currentPerson,
        notificationId: req.body.notificationId
      }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError())
        }

        Notification.find({
          id: hashids.decode(req.body.notificationId)[0]
        }, function (err, notification) {
          if (err) { return next(err) }

          var notif = new Notification(notification[0])
          notif.read = true
          notif.save(function (err) {
            if (err) { return next(err) }

            return res.json({ status: 'ok' })
          })
        })
      })
    },

    markAllAsRead: function (req, res, next) {
      /* DELETE
       * req.body = {}
       */

      ACL.isAllowed('markAllAsRead', 'notifications', req.role, {
        currentPerson: req.currentPerson,
      }, function (err, response) {
        if (err) { return next(err) }

        if (!response.isAllowed) {
          return next(new ForbiddenError())
        }

        EntityOwner.find({
          owner_id: response.follower.id
        }, function (err, owners) {
          var ids = owners.map(function (owner) {
            return owner.ownedId
          })
          ids.push(response.follower.id)

          db('Notifications')
            .whereIn('follower_id', ids)
            .andWhere('read', '=', false)
            .andWhere('for_feed', '=', false)
            .asCallback(function (err, rows) {
              if (err) { return next(err) }

              var ids = rows.map(function (row) {
                return row.id
              })

              db('Notifications')
                .whereIn('id', ids)
                .update({
                  read: true,
                })
                .asCallback(function (err, affectedRows) {
                  if (err) { return next(err) }

                  res.json({
                    status: 'ok',
                    affectedNotifications: affectedRows,
                  })
                })
            })
        })
      })
    },

    updateNotificationSettings: function (req, res, next) {
      /* PUT
       * req.body = {
       *   webSettings: {
       *     ...
       *   },
       *   emailSettings: {
       *     ...
       *   },
       * }
       */

      ACL.isAllowed('updateNotificationSettings', 'entities', req.role, {
        entity: req.entity,
        currentPerson: req.currentPerson,
      }, function (err, response) {
        if (err) { return next(err) }

        if (!response.isAllowed) {
          return next(new ForbiddenError('Unauthorized.'))
        }

        Entity.find({ profile_name: req.entity.profileName }, function (err, entity) {
          if (err) { return next(err) }

          NotificationSetting.find({ entity_id: entity[0].id }, function (err, setting) {
            if (err) { return next(err) }

            var newSetting = new NotificationSetting(setting[0])
            _.extend(newSetting.webSettings, req.body.webSettings)
            _.extend(newSetting.emailSettings, req.body.emailSettings)

            newSetting.save(function (err) {
              if (err) { return next(err) }

              return res.json({ status: 'updated settings' })
            })
          })
        })
      })
    },

  },

})

module.exports = new NotificationsController()
