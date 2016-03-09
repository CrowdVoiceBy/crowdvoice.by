'use strict'

var uuid = require('uuid') // use .v4

var NotificationSettingsController = Class('NotificationSettingsController').includes(BlackListFilter)({

  createEmailLink: function (entityId, callback) {
    var emailLink = new EmailLink({
        entityId: entityId,
      }),
      emailUuidBuffer = new Buffer(16)

    uuid.v4(null, emailUuidBuffer, 0)

    emailLink.emailUuid = uuid.unparse(emailUuidBuffer)

    emailLink.save(function (err) {
      if (err) { return callback(err) }

      return callback(null, emailLink.emailUuid)
    })
  },

  prototype: {

    deactivateEmailSetting: function (req, res, next) {
      /**
       * query string = {
       *   s = settingName (hashids),
       *   u = emailUuid,
       * }
       */

      ACL.isAllowed('deactivateEmailSetting', 'notificationSettings', req.role, {
        queryString: req.query,
      }, function (err, isAllowed) {
        if (err) { return next(err) }

        if (!isAllowed) {
          return next(new ForbiddenError('Link is no longer valid.'))
        }

        EmailLink.find({ email_uuid: req.query.u }, function (err, result) {
          if (err) { return next(err) }

          NotificationSetting.find({ entity_id: result[0].entityId }, function (err, result) {
            if (err) { return next(err) }

            var setting = new NotificationSetting(result[0])

            setting.emailSettings[req.query.s] = false

            setting.save(function (err) {
              if (err) { return next(err) }
              req.flash('success', 'Email notification deactivated.');

              if (req.currentPerson) {
                return res.redirect('/' + req.currentPerson.profileName + '/home');
              }

              return res.redirect('/')
            })
          })
        })
      })
    },

  },

})

module.exports = new NotificationSettingsController()
