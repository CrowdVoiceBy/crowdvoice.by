var mandrill = require('mandrill-api/mandrill'),
  client = new mandrill.Mandrill(CONFIG.mandrill.key || false),
  moment = require('moment')

var EntitiesPresenter = require(path.join(__dirname, '../presenters/EntitiesPresenter.js')),
  VoicesPresenter = require(path.join(__dirname, '../presenters/VoicesPresenter.js'))

var notificationViewFile = fs.readFileSync('./views/mailers/notification/notification.html', 'utf8'),
  newMessageViewFile = fs.readFileSync('./views/mailers/notification/newMessage.html', 'utf8'),
  newInvitationViewFile = fs.readFileSync('./views/mailers/notification/newInvitation.html', 'utf8'),
  newRequestViewFile = fs.readFileSync('./views/mailers/notification/newRequest.html', 'utf8'),
  newEntityFollowerViewFile = fs.readFileSync('./views/mailers/notification/newEntityFollower.html', 'utf8'),
  newVoiceFollowerViewFile = fs.readFileSync('./views/mailers/notification/newVoiceFollower.html', 'utf8')

var NotificationMailer = Module('NotificationMailer')({

  // Send notification about new message
  newMessage: function (receiver, info, callback) {
    NotificationSetting.find({ entity_id: (receiver.entity.isAnonymous ? receiver.realEntity.id : receiver.entity.id) }, function (err, setting) {
      if (err) { return callback(err) }

      if (!setting[0].emailSettings.selfNewMessage) {
        return callback()
      }

      // CHECK IF THERE'S BEEN A MESSAGE WITHIN THE LAST 24 HOURS BY THE SAME
      // USER TO THE SAME USER, IF YES THEN DON'T SEND MESSAGE, IF NOT THEN DO.

      // get newest message that was sent to the receiver that is not the message
      // we just sent and that is part of the same thread
      Message.find(['type = ? AND thread_id = ? AND receiver_entity_id = ? ORDER BY created_at DESC LIMIT ?',
                   ['message', info.message.threadId, info.message.receiverEntityId, 2]], function (err, messages) {
        if (err) { return callback(err) }

        var isSender = new MessageThread(info.thread).isPersonSender(receiver.entity.id)
          isReceiver = !isSender,
          isUnread = false

        // auto-unread, since we haven't even seen this thread before
        if (isSender && info.thread.lastSeenSender === null
          || isReceiver && info.thread.lastSeenReceiver === null) {
          isUnread = true
        } else {
          // maybe the messages got deleted from DB or something, but since we
          // got to this point it means that this is the first time this message
          // is being seen.
          if (messages.length < 2) {
            isUnread = true
          } else {
            // message was created after thread last read by receiver
            isUnread = (
              moment(messages[1].createdAt).format('X')
              >
              moment(info.thread['lastSeen' + (isSender ? 'Sender' : 'Receiver')]).format('X')
            )
          }
        }

        // oh wait it's unread, well was it sent within the last 24 hours?
        // make sure it's unread AND there are at least 2 messages, otherwise it
        // means that this is the first message and the mail needs to be sent
        if (isUnread && messages[1]) {
          var time = moment().diff(moment(info.thread.updatedAt), 'hours')

          // too soon, let's bail
          if (time <= 24) {
            return callback()
          }
        }

        // SEND EMAIL LIKE NORMAL

        Entity.findById(info.message.senderEntityId, function (err, sender) {
          if (err) { return callback(err) }

          EntitiesPresenter.build(sender, null, function (err, presented) {
            if (err) { return callback(err) }

            NotificationSettingsController.createEmailLink(receiver.realEntity.id, function (err, uuid) {
              if (err) { return callback(err) }

              var template = new Thulium({ template: newMessageViewFile }),
                message = {
                  html: '',
                  subject: 'CrowdVoice.by - You have received a new message from ' + sender[0].name,
                  from_email: 'notifications@crowdvoice.by',
                  from_name: 'CrowdVoice.by',
                  to: [],
                  important: true,
                  auto_text: true,
                  inline_css: true,
                },
                realThread = _.clone(info.thread)

              realThread.id = hashids.encode(realThread.id)

              template.parseSync().renderSync({
                params: {
                  receiver: receiver,
                  thread: realThread,
                  message: info.message,
                  sender: presented[0],
                  uuid: uuid,
                },
              })

              var view = template.view

              message.html = view

              message.to.push({
                email: receiver.user.email,
                name: receiver.user.name,
                type: 'to',
              })

              client.messages.send({ message: message, async: true }, function (result) {
                logger.info('NotificationMailer newMessage():')
                logger.info(result)

                return callback(null, result)
              }, function (err) {
                logger.error('NotificationMailer newMessage(): A mandrill error occurred: ' + err.name + ' - ' + err.message)
                return callback(err)
              })
            })
          })
        })
      })
    })
  },

  // Send on new invitation
  newInvitation: function (receiver, info, callback) {
    NotificationSetting.find({ entity_id: (receiver.entity.isAnonymous ? receiver.realEntity.id : receiver.entity.id) }, function (err, setting) {
      if (err) { return callback(err) }

      if (!setting[0].emailSettings.selfNewInvitation) {
        return callback()
      }

      Entity.findById(info.message.senderEntityId, function (err, sender) {
        if (err) { return callback(err) }

        EntitiesPresenter.build(sender, null, function (err, presented) {
          if (err) { return callback(err) }

          var invitationVoice,
           invitationOrganization

          async.series([
            function (next) {
              if (!info.message.voiceId) {
                return next()
              }

              Voice.findById(info.message.voiceId, function (err, voice) {
                if (err) { return next(err) }

                VoicesPresenter.build(voice, null, function (err, voice) {
                  if (err) { return next(err) }

                  invitationVoice = voice[0]

                  return next()
                })
              })
            },

            function (next) {
              if (!info.message.organizationId) {
                return next()
              }

              Entity.findById(info.message.organizationId, function (err, entity) {
                if (err) { return next(err) }

                EntitiesPresenter.build(entity, null, function (err, entity) {
                  if (err) { return next(err) }

                  invitationOrganization = entity[0]

                  return next()
                })
              })
            },
          ], function (err) {
            if (err) { return callback(err) }

            NotificationSettingsController.createEmailLink(receiver.realEntity.id, function (err, uuid) {
              if (err) { return callback(err) }

              var template = new Thulium({ template: newInvitationViewFile }),
                message = {
                  html: '',
                  subject: 'CrowdVoice.by - You have received a new invitation from ' + sender[0].name,
                  from_email: 'notifications@crowdvoice.by',
                  from_name: 'CrowdVoice.by',
                  to: [],
                  important: true,
                  auto_text: true,
                  inline_css: true,
                },
                realThread = _.clone(info.thread)

              realThread.id = hashids.encode(realThread.id)

              template.parseSync().renderSync({
                params: {
                  receiver: receiver,
                  thread: realThread,
                  message: info.message,
                  sender: presented[0],
                  invitationVoice: invitationVoice,
                  invitationOrganization: invitationOrganization,
                  uuid: uuid,
                },
              })

              var view = template.view

              message.html = view

              message.to.push({
                email: receiver.user.email,
                name: receiver.user.name,
                type: 'to',
              })

              client.messages.send({ message: message, async: true }, function (result) {
                logger.info('NotificationMailer newInvitation():')
                logger.info(result)

                return callback(null, result)
              }, function (err) {
                logger.error('NotificationMailer newInvitation(): A mandrill error occurred: ' + err.name + ' - ' + err.message)
                return callback(err)
              })
            })
          })
        })
      })
    })
  },

  // Send on new request
  newRequest: function (receiver, info, callback) {
    NotificationSetting.find({ entity_id: (receiver.entity.isAnonymous ? receiver.realEntity.id : receiver.entity.id) }, function (err, setting) {
      if (err) { return callback(err) }

      if (!setting[0].emailSettings.selfNewRequest) {
        return callback()
      }

      Entity.findById(info.message.senderEntityId, function (err, sender) {
        if (err) { return callback(err) }

        EntitiesPresenter.build(sender, null, function (err, presented) {
          if (err) { return callback(err) }

          var requestVoice,
           requestOrganization

          async.series([
            function (next) {
              if (!info.message.voiceId) {
                return next()
              }

              Voice.findById(info.message.voiceId, function (err, voice) {
                if (err) { return next(err) }

                VoicesPresenter.build(voice, null, function (err, voice) {
                  if (err) { return next(err) }

                  requestVoice = voice[0]

                  return next()
                })
              })
            },

            function (next) {
              if (!info.message.organizationId) {
                return next()
              }

              Entity.findById(info.message.organizationId, function (err, entity) {
                if (err) { return next(err) }

                EntitiesPresenter.build(entity, null, function (err, entity) {
                  if (err) { return next(err) }

                  requestOrganization = entity[0]

                  return next()
                })
              })
            },
          ], function (err) {
            if (err) { return callback(err) }

            NotificationSettingsController.createEmailLink(receiver.realEntity.id, function (err, uuid) {
              if (err) { return callback(err) }

              var template = new Thulium({ template: newRequestViewFile }),
                message = {
                  html: '',
                  subject: 'CrowdVoice.by - You have received a new request from ' + sender[0].name,
                  from_email: 'notifications@crowdvoice.by',
                  from_name: 'CrowdVoice.by',
                  to: [],
                  important: true,
                  auto_text: true,
                  inline_css: true,
                },
                realThread = _.clone(info.thread)

              realThread.id = hashids.encode(realThread.id)

              template.parseSync().renderSync({
                params: {
                  receiver: receiver,
                  thread: realThread,
                  message: info.message,
                  sender: presented[0],
                  requestVoice: requestVoice,
                  requestOrganization: requestOrganization,
                  uuid: uuid,
                },
              })

              var view = template.view

              message.html = view

              message.to.push({
                email: receiver.user.email,
                name: receiver.user.name,
                type: 'to',
              })

              client.messages.send({ message: message, async: true }, function (result) {
                logger.info('NotificationMailer newRequest():')
                logger.info(result)

                return callback(null, result)
              }, function (err) {
                logger.error('NotificationMailer newRequest(): A mandrill error occurred: ' + err.name + ' - ' + err.message)
                return callback(err)
              })
            })
          })
        })
      })
    })
  },

  // Send on new follow of your voice
  newVoiceFollower: function (receiver, newFollowerEntity, followedVoice, callback) {
    NotificationSetting.find({ entity_id: (receiver.entity.isAnonymous ? receiver.realEntity.id : receiver.entity.id) }, function (err, setting) {
      if (err) { return callback(err) }

      if (!setting[0].emailSettings.selfNewVoiceFollower) {
        return callback()
      }

      EntitiesPresenter.build([newFollowerEntity], null, function (err, presentedEntity) {
        if (err) { return callback(err) }

        VoicesPresenter.build([followedVoice], null, function (err, presentedVoice) {
          if (err) { return callback(err) }

          NotificationSettingsController.createEmailLink(receiver.realEntity.id, function (err, uuid) {
            if (err) { return callback(err) }

            var template = new Thulium({ template: newVoiceFollowerViewFile }),
              message = {
                html: '',
                subject: 'CrowdVoice.by - Your voice has a new follower',
                from_email: 'notifications@crowdvoice.by',
                from_name: 'CrowdVoice.by',
                to: [],
                important: true,
                auto_text: true,
                inline_css: true,
              }

            template.parseSync().renderSync({
              params: {
                receiver: receiver,
                follower: presentedEntity[0],
                voice: presentedVoice[0],
                uuid: uuid,
              },
            })

            var view = template.view

            message.html = view

            message.to.push({
              email: receiver.user.email,
              name: receiver.user.name,
              type: 'to',
            })

            client.messages.send({ message: message, async: true }, function (result) {
              logger.info('NotificationMailer newVoiceFollower():')
              logger.info(result)

              return callback(null, result)
            }, function (err) {
              logger.error('NotificationMailer newVoiceFollower(): A mandrill error occurred: ' + err.name + ' - ' + err.message)
              return callback(err)
            })
          })
        })
      })
    })
  },

  // Send on entity following you
  newEntityFollower: function (receiver, newFollowerEntity, callback) {
    NotificationSetting.find({ entity_id: (receiver.entity.isAnonymous ? receiver.realEntity.id : receiver.entity.id) }, function (err, setting) {
      if (err) { return callback(err) }

      if (!setting[0].emailSettings.selfNewEntityFollower) {
        return callback()
      }

      EntitiesPresenter.build([newFollowerEntity], null, function (err, presented) {
        if (err) { return callback(err) }

        NotificationSettingsController.createEmailLink(receiver.realEntity.id, function (err, uuid) {
          if (err) { return callback(err) }

          var template = new Thulium({ template: newEntityFollowerViewFile }),
            message = {
              html: '',
              subject: 'CrowdVoice.by - You have a new follower',
              from_email: 'notifications@crowdvoice.by',
              from_name: 'CrowdVoice.by',
              to: [],
              important: true,
              auto_text: true,
              inline_css: true,
            }

          template.parseSync().renderSync({
            params: {
              receiver: receiver,
              follower: presented[0],
              uuid: uuid,
            },
          })

          var view = template.view

          message.html = view

          message.to.push({
            email: receiver.user.email,
            name: receiver.user.name,
            type: 'to',
          })

          client.messages.send({ message: message, async: true }, function (result) {
            logger.info('NotificationMailer newEntityFollower():')
            logger.info(result)

            return callback(null, result)
          }, function (err) {
            logger.error('NotificationMailer newEntityFollower(): A mandrill error occurred: ' + err.name + ' - ' + err.message)
            return callback(err)
          })
        })
      })
    })
  },
})

module.exports = NotificationMailer
