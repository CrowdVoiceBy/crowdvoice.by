'use strict'

var NotificationMailer = require(path.join(__dirname, '../mailers/NotificationMailer.js'))

var FeedInjector = Class('FeedInjector')({

  _instance: null,

  getInstance: function () {
    if (FeedInjector._instance) {
      return FeedInjector._instance
    } else {
      FeedInjector._instance = new FeedInjector()
      return FeedInjector._instance
    }
  },

  prototype: {

    inject: function () {
      // NOTE: Apparently this is bad practice as it prevents engines (V8) from
      //       optimizing
      var args = Array.prototype.slice.call(arguments)

      return this.injectFeed.apply(this, args)
    },

    injectFeed: function (whoId, actionString, itemModel, callback) {
      var splitString = actionString.split(' ')

      if (splitString.length !== 2) {
        return callback(new Error("Invalid 'actionString' argument"))
      }

      var followersOf = splitString[0],
        actionFunction = splitString[1]

      if (followersOf.match(/^(who|item|both)$/) === null) {
        return callback(new Error("Invalid 'followersOf' string"))
      }

      if (actionFunction.match(/^notif/) !== null) {
        return callback(new Error("Action function cannot have 'notif' prefix"))
      }

      if (!this['_' + actionFunction]) {
        return callback(new Error("Action function '" + actionFunction + "' does not exist"))
      }

      this['_' + actionFunction].call(this, itemModel, whoId, followersOf, callback)
    },

    injectNotification: function (whoId, actionString, itemModel, callback) {
      var splitString = actionString.split(' '),
        followersOf,
        actionFunction

      if (splitString.length > 1) {
        followersOf = splitString[0]
        actionFunction = splitString[1]
      } else {
        actionFunction = splitString[0]
      }

      if (actionFunction.match(/^notif/) === null) {
        return callback(new Error("Action function must have 'notif' prefix"))
      }

      if (!this['_' + actionFunction]) {
        return callback(new Error("Action function '" + actionFunction + "' does not exist"))
      }

      this['_' + actionFunction].call(this, itemModel, whoId, function (err) {
        if (err) { return callback(err) }

        var emailName,
          getMessages = false,
          modelProperty,
          settingName,
          message,
          thread,
          voice,
          receiverEntity,
          realReceiverEntity,
          receiverUser,
          followerEntity

        switch (actionFunction) {
          case 'notifNewMessage':
            emailName = 'newMessage'
            getMessages = true
            modelProperty = 'receiverEntityId'
            settingName = 'selfNewMessage'
            break
          case 'notifNewRequest':
            emailName = 'newRequest'
            getMessages = true
            modelProperty = 'receiverEntityId'
            settingName = 'selfNewRequest'
            break
          case 'notifNewInvitation':
            emailName = 'newInvitation'
            getMessages = true
            modelProperty = 'receiverEntityId'
            settingName = 'selfNewInvitation'
            break
          case 'notifNewVoiceFollower':
            emailName = 'newVoiceFollower'
            modelProperty = 'voiceId'
            settingName = 'selfNewVoiceFollower'
            break
          case 'notifNewEntityFollower':
            emailName = 'newEntityFollower'
            modelProperty = 'followedId'
            settingName = 'selfNewEntityFollower'
            break
        }

        async.series([
          // Do we need to get Message info?  If yes, do it. (getMessages)
          function (nextSeries1) {
            if (!getMessages) {
              return nextSeries1()
            }

            message = new Message(itemModel)

            MessageThread.find({ id: message.threadId }, function (err, result) {
             if (err) { return nextSeries1(err) }

             thread = new MessageThread(result[0])

             return nextSeries1()
            })
          },

          // NotificationMailer info. (receiver info)
          function (nextSeries1) {
            var firstValue = itemModel[modelProperty]

            // setup for sending emails
            async.series([
              function (nextSeries2) {
                if (modelProperty !== 'voiceId') {
                  return nextSeries2()
                }

                Voice.find({ id: itemModel.voiceId }, function (err, result) {
                  if (err) { return nextSeries2(err) }

                  firstValue = result[0].ownerId

                  return nextSeries2()
                })
              },

              // get receiver entity, could be org or person
              function (nextSeries2) {
                Entity.findById(firstValue, function (err, entity) {
                  if (err) { return nextSeries2(err) }

                  receiverEntity = entity[0]

                  return nextSeries2()
                })
              },

              // get real receiver entity, can only be person
              function (nextSeries2) {
                if (receiverEntity.type === 'person' && !receiverEntity.isAnonymous) {
                  realReceiverEntity = receiverEntity
                  return nextSeries2()
                }

                EntityOwner.find({ owned_id: receiverEntity.id }, function (err, ownership) {
                  if (err) { return nextSeries2(err) }

                  Entity.findById(ownership[0].ownerId, function (err, entity) {
                    if (err) { return nextSeries2(err) }

                    realReceiverEntity = entity[0]

                    return nextSeries2()
                  })
                })
              },

              // get user of real receiver entity
              function (nextSeries2) {
                User.find({ entity_id: realReceiverEntity.id }, function (err, user) {
                  if (err) { return nextSeries2(err) }

                  receiverUser = user[0]

                  return nextSeries2()
                })
              },
            ], nextSeries1) // 2 async.series
          },

          // Get voice for notification
          function (nextSeries1) {
            if (emailName !== 'newVoiceFollower') {
              return nextSeries1()
            }

            Voice.find({ id: itemModel.voiceId, }, function (err, result) {
              if (err) { return nextSeries1(err) }

              voice = new Voice(result[0])

              return nextSeries1()
            })
          },

          // Get sender entity
          function (nextSeries1) {
            async.series([
              function (nextSeries2) {
                if (emailName !== 'newVoiceFollower') {
                  return nextSeries2()
                }

                Entity.find({ id: itemModel.entityId }, function (err, result) {
                  if (err) { return nextSeries2(err) }

                  followerEntity = new Entity(result[0])

                  return nextSeries2()
                })
              },

              function (nextSeries2) {
                if (emailName !== 'newEntityFollower') {
                  return nextSeries2()
                }

                Entity.find({ id: itemModel.followerId }, function (err, result) {
                  if (err) { return nextSeries2(err) }

                  followerEntity = new Entity(result[0])

                  return nextSeries2()
                })
              },
            ], nextSeries1)
          }
        ], function (err) { // 1 async.series
          if (err) { return callback(err) }

          NotificationSetting.find({ entity_id: realReceiverEntity.id }, function (err, result) {
            if (err) { return callback(err) }

            if (!result[0].emailSettings[settingName]) {
              return callback()
            }

            if (getMessages) {
              return NotificationMailer[emailName]({
                entity: receiverEntity,
                realEntity: realReceiverEntity,
                user: receiverUser,
              }, {
                thread: thread,
                message: message
              }, callback)
            } else if (emailName === 'newVoiceFollower') {
              if (voice.status !== Voice.STATUS_PUBLISHED) {
                return callback()
              }

              return NotificationMailer[emailName]({
                entity: receiverEntity,
                realEntity: realReceiverEntity,
                user: receiverUser,
              }, followerEntity, voice, callback)
            } else if (emailName === 'newEntityFollower') {
              return NotificationMailer[emailName]({
                entity: receiverEntity,
                realEntity: realReceiverEntity,
                user: receiverUser,
              }, followerEntity, callback)
            }
          })
        })
      })
    },

    _deleteDuplicates: function (actionObj, callback) {
      FeedAction.find(actionObj, function (err, result) {
        if (err) { return callback(err) }

        var feedIds = result.map(function (feed) { return feed.id })

        async.series([
          function (nextSeries) {
            db('Notifications')
              .whereIn('action_id', feedIds)
              .del()
              .asCallback(nextSeries)
          },

          function (nextSeries) {
            db('FeedActions')
              .whereIn('id', feedIds)
              .del()
              .asCallback(nextSeries)
          },
        ], callback)
      })
    },

    _createFeedEntry: function (actionObj, followersOf, callback) {
      var snakeActionObj = {
        item_type: actionObj.itemType,
        item_id: actionObj.itemId,
        action: actionObj.action,
        who: actionObj.who,
      }

      this._deleteDuplicates(snakeActionObj, function (err) {
        if (err) { return callback(err) }

        var feedAction = new FeedAction(actionObj)

        feedAction.save(function (err) {
          if (err) { return callback(err) }

          var followerIds = []

          // figure out whose followers to notify
          async.series([
            // Who followers
            function (nextSeries) {
              if (followersOf.match(/^(who|both)$/) === null) {
                return nextSeries()
              }

              EntityFollower.find({ followed_id: actionObj.who }, function (err, result) {
                if (err) { return nextSeries(err) }

                followerIds = result.map(function (follower) { return follower.followerId })

                return nextSeries()
              })
            },

            // Item followers
            function (nextSeries) {
              if (followersOf.match(/^(item|both)$/) === null) {
                return nextSeries()
              }

              if (actionObj.itemType === 'voice') {
                VoiceFollower.find({ voice_id: actionObj.itemId }, function (err, result) {
                  if (err) { return nextSeries(err) }

                  followerIds.concat(result.map(function (follower) { return follower.entityId }))

                  return nextSeries()
                })
              } else if (actionObj.itemType === 'entity') {
                EntityFollower.find({ followed_id: actionObj.itemId }, function (err, result) {
                  if (err) { return nextSeries(err) }

                  followerIds.concat(result.map(function (follower) { return follower.followerId }))

                  return nextSeries()
                })
              }
            },

            // Remove duplicates
            function (nextSeries) {
              followerIds = _.uniq(followerIds)

              return nextSeries()
            },
          ], function (err) { // async.series
            if (err) { return callback(err) }

            async.each(followerIds, function (followerId, doneEach) {
              var notification = new Notification({
                actionId: feedAction.id,
                followerId: followerId,
                read: true,
                forFeed: true,
              })

              notification.save(doneEach)
            }, callback)
          })
        })
      })
    },

    _createNotificationEntry: function (actionFunctionName, actionObj, notifiedEntityId, callback) {
      Entity.find({
        id: notifiedEntityId,
      }, function (err, result) {
        if (err) { return callback(err) }

        var entity = new Entity(result[0]),
          toBeNotifiedEntity,
          setting = false

        async.series([
          // Find real entity to notify
          function (nextSeries) {
            if (entity.type === 'person' && !entity.isAnonymous) {
              toBeNotifiedEntity = new Entity(entity)

              return nextSeries()
            } else if (entity.type === 'person' && entity.isAnonymous
              || entity.type === 'organization') {

              entity.owner(function (err, owner) {
                if (err) { return nextSeries(err) }

                toBeNotifiedEntity = new Entity(owner)

                return nextSeries()
              })
            }
          },

          // Find entity's notification settings
          function (nextSeries) {
            NotificationSetting.find({
              entity_id: toBeNotifiedEntity.id
            }, function (err, result) {
              if (err) { return nextSeries(err) }

              var settingName

              switch (actionFunctionName) {
                case 'notifNewMessage':
                  settingName = 'selfNewMessage'
                  break
                case 'notifNewRequest':
                  settingName = 'selfNewRequest'
                  break
                case 'notifNewInvitation':
                  settingName = 'selfNewInvitation'
                  break
                case 'notifNewVoiceFollower':
                  settingName = 'selfNewVoiceFollower'
                  break
                case 'notifNewEntityFollower':
                  settingName = 'selfNewEntityFollower'
                  break
              }

              setting = result[0].webSettings[settingName]

              return nextSeries()
            })
          },
        ], function (err) {
          if (err) { return callback(err) }

          // User doesn't want to be notified
          if (!setting) {
            return callback()
          }

          var feedAction = new FeedAction(actionObj)

          feedAction.save(function (err) {
            if (err) { return callback(err) }

            var notification = new Notification({
              actionId: feedAction.id,
              followerId: toBeNotifiedEntity.id,
              read: false,
              forFeed: false,
            })

            notification.save(callback)
          })
        })
      })
    },

    /**
     * FEED ACTION FUNCTIONS
     */

    _entityFollowsEntity: function (entityFollowerModel, whoId, followersOf, callback) {
      this._createFeedEntry({
        itemType: 'entity',
        itemId: entityFollowerModel.followedId,
        action: 'followed',
        who: whoId,
      }, followersOf, callback)
    },

    _entityFollowsVoice: function (voiceFollowerModel, whoId, followersOf, callback) {
      Voice.findById(voiceFollowerModel.voiceId, function (err, voice) {
        if (err) { return callback(err) }

        if (voice[0].status !== Voice.STATUS_PUBLISHED) {
          return callback(null)
        }

        this._createFeedEntry({
          itemType: 'voice',
          itemId: voiceFollowerModel.voiceId,
          action: 'followed',
          who: whoId,
        }, followersOf, callback)
      }.bind(this))
    },

    _entityArchivesVoice: function (voiceModel, whoId, followersOf, callback) {
      if (voiceModel.status !== Voice.STATUS_ARCHIVED) {
        return callback(null)
      }

      this._createFeedEntry({
        itemType: 'voice',
        itemId: voiceModel.id,
        action: 'archived',
        who: whoId,
      }, followersOf, callback)
    },

    _entityUpdatesAvatar: function (entityModel, whoId, followersOf, callback) {
      if (entityModel.isAnonymous) {
        return callback(null)
      }

      this._createFeedEntry({
        itemType: 'entity',
        itemId: entityModel.id,
        action: 'changed avatar',
        who: whoId,
      }, followersOf, callback)
    },

    _entityUpdatesBackground: function (entityModel, whoId, followersOf, callback) {
      if (entityModel.isAnonymous) {
        return callback(null)
      }

      this._createFeedEntry({
        itemType: 'entity',
        itemId: entityModel.id,
        action: 'changed background',
        who: whoId,
      }, followersOf, callback)
    },

    _entityBecomesOrgPublicMember: function (entityMembershipModel, whoId, followersOf, callback) {
      if (entityMembershipModel.isAnonymous) {
        return callback(null)
      }

      this._createFeedEntry({
        itemType: 'entity',
        itemId: entityMembershipModel.entityId,
        action: 'became public member',
        who: whoId,
      }, followersOf, callback)
    },

    _voiceIsPublished: function (voiceModel, whoId, followersOf, callback) {
      if (voiceModel.status !== Voice.STATUS_PUBLISHED) {
        return callback(null)
      }

      this._createFeedEntry({
        itemType: 'voice',
        itemId: voiceModel.id,
        action: 'published',
        who: whoId,
      }, followersOf, callback)
    },

    _voiceNewPosts: function (voiceModel, whoId, followersOf, callback) {
      if (voiceModel.status !== Voice.STATUS_PUBLISHED) {
        return callback(null)
      }

      FeedAction.find(['action = ? AND item_type = ? AND item_id = ? ORDER BY created_at DESC LIMIT ?', ['new posts', 'voice', voiceModel.id, 1]], function (err, result) {
        if (err) { return callback(err) }

        var isAllowed = false,
          time = 0;

        // no results, first record of this, is allowed
        if (result.length === 0) {
          isAllowed = true;
        }

        if (!isAllowed) {
          time = moment().diff(moment(result[0].createdAt), 'hours')

          if (time <= 24) {
            isAllowed = false;
          } else {
            isAllowed = true;
          }
        }

        if (!isAllowed) {
          return callback()
        } else {
          this._createFeedEntry({
            itemType: 'voice',
            itemId: voiceModel.id,
            action: 'new posts',
            who: whoId,
          }, followersOf, callback)
        }
      }.bind(this))
    },

    _voiceNewTitle: function (voiceModel, whoId, followersOf, callback) {
      if (voiceModel.status !== Voice.STATUS_PUBLISHED) {
        return callback(null)
      }

      this._createFeedEntry({
        itemType: 'voice',
        itemId: voiceModel.id,
        action: 'new title',
        who: whoId,
      }, followersOf, callback)
    },

    _voiceNewDescription: function (voiceModel, whoId, followersOf, callback) {
      if (voiceModel.status !== Voice.STATUS_PUBLISHED) {
        return callback(null)
      }

      this._createFeedEntry({
        itemType: 'voice',
        itemId: voiceModel.id,
        action: 'new description',
        who: whoId,
      }, followersOf, callback)
    },

    _voiceNewPublicContributor: function (voiceCollaboratorModel, whoId, followersOf, callback) {
      if (voiceCollaboratorModel.isAnonymous) {
        return callback(null)
      }

      Voice.findById(voiceCollaboratorModel.voiceId, function (err, voice) {
        if (err) { return callback(err) }

        if (voice[0].status !== Voice.STATUS_PUBLISHED) {
          return callback(null)
        }

        this._createFeedEntry({
          itemType: 'voice',
          itemId: voiceCollaboratorModel.voiceId,
          action: 'became public contributor',
          who: whoId,
        }, followersOf, callback)
      }.bind(this))
    },

    /**
     * NOTIFICATION ACTION FUNCTIONS
     */

    _notifNewMessage: function (messageModel, whoId, callback) {
      this._createNotificationEntry('notifNewMessage', {
        itemType: 'message',
        itemId: messageModel.id,
        action: 'sent you a message',
        who: whoId, // or messageModel.senderEntityId
      }, messageModel.receiverEntityId, callback)
    },

    _notifNewRequest: function (messageModel, whoId, callback) {
      var itemType,
        itemId,
        action

      if (messageModel.voiceId) {
        itemType = 'voice'
        itemId = messageModel.voiceId
        action = 'a contributor'
      } else if (messageModel.organizationId) {
        itemType = 'entity'
        itemId = messageModel.organizationId
        action = 'a member'
      }

      this._createNotificationEntry('notifNewRequest', {
        itemType: itemType,
        itemId: itemId,
        action: 'requested to become ' + action,
        who: whoId, // or voiceCollaboratorModel.collaboratorId
      }, messageModel.receiverEntityId, callback)
    },

    _notifNewInvitation: function (messageModel, whoId, callback) {
      var itemType,
        itemId,
        action

      if (messageModel.voiceId) {
        itemType = 'voice'
        itemId = messageModel.voiceId
        action = 'a contributor'
      } else if (messageModel.organizationId) {
        itemType = 'entity'
        itemId = messageModel.organizationId
        action = 'a member'
      }

      this._createNotificationEntry('notifNewRequest', {
        itemType: itemType,
        itemId: itemId,
        action: 'has invited you to become ' + action,
        who: whoId, // or messageModel.senderEntityId
      }, messageModel.receiverEntityId, callback)
    },

    _notifNewVoiceFollower: function (voiceFollowerModel, whoId, callback) {
      var that = this

      Voice.find({ id: voiceFollowerModel.voiceId }, function (err, result) {
        if (err) { return callback(err) }

        var voice = new Voice(result[0])

        if (voice.status !== Voice.STATUS_PUBLISHED) {
          return callback()
        }

        that._createNotificationEntry('notifNewVoiceFollower', {
          itemType: 'voice',
          itemId: voiceFollowerModel.voiceId,
          action: 'followed your voice',
          who: whoId, // or voiceFollowerModel.voiceId
        }, voice.ownerId, callback)
      })
    },

    _notifNewEntityFollower: function (entityFollowerModel, whoId, callback) {
      this._createNotificationEntry('notifNewEntityFollower', {
        itemType: 'entity',
        itemId: entityFollowerModel.followedId,
        action: 'followed you',
        who: whoId, // or entityFollowerModel.followerId
      }, entityFollowerModel.followedId, callback)
    },

  },

})

module.exports = FeedInjector.getInstance
