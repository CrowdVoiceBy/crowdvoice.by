var FeedInjector = require(path.join(__dirname, '../lib/FeedInjector.js'));

var MessageThread = Class('MessageThread').inherits(Argon.KnexModel)({

  validations: {
    senderPersonId: [
      'required',
      {
        rule: function(val) {
          return db('Entities')
            .where({
              id: val,
              is_anonymous: false
            })
            .then(function(resp) {
              if (resp.length === 0) {
                throw new Checkit.FieldError('This senderPersonId doesn\'t exists!.');
              }
            });
        },
        message: 'This senderPersonId doesn\'t exist!.'
      },
      {
        rule: function(val) {
          var rule = this;

          return db('Entities').where({id: val}).then(function(response) {
            if (response[0].type !== 'person') {
              throw new Checkit.FieldError('The senderPerson is not of type person');
            }
          });
        }
      },
      {
        rule: function(val) {
          var rule = this;

          return db('Users').where({entity_id: val}).then(function(user) {
            user = user[0];

            if (user.deleted) {
              throw new Checkit.FieldError('This senderPerson\'s user has been deactivated');
            }
          });
        }
      }
    ],

    senderEntityId: ['required',
      {
        rule: function(val) {
          return db('Entities')
            .where({
              id: val,
              is_anonymous: false
            })
            .then(function(resp) {
              if (resp.length === 0) {
                throw new Checkit.FieldError('This senderEntityId doesn\'t exists!.');
              }
          });
        }
      },
      {
        rule: function(val) {
          var rule = this;

          return db('Entities').where({id: val}).then(function(senderEntity) {
            if (rule.target.senderEntityId && rule.target.senderPersonId) {

              senderEntity = senderEntity[0];

              if (senderEntity.type === 'person') {
                if (senderEntity.id !== rule.target.senderPersonId) {
                  throw new Checkit.FieldError('senderEntity is not equal to senderPerson');
                }
              }
            }
          });
        },
        message: 'senderEntity is not equal to senderPerson.'
      },
      {
        rule: function(val) {
          var rule = this;

          db('Users').where({entity_id: val}).then(function(user) {
            user = user;

            if (user.deleted) {
              throw new Error('senderEntity user has been deactivated!');
            }
          });
        }
      },
      {
        rule: function(val) {
          var rule = this;

          return db('Entities').where({id: val}).then(function(senderEntity) {
            senderEntity = senderEntity[0];

            if (senderEntity.type !== 'person') {
              return db('Entities').where({id: rule.target.senderPersonId}).then(function(senderPerson) {
                senderPerson = senderPerson[0];

                return db('EntityOwner').where({owner_id: senderPerson.id, owned_id: senderEntity.id}).then(function(owner) {
                  var isOwner  = false;

                  if (owner.length !== 0) {
                    isOwner = true;
                  }

                  if (!isOwner) {
                    throw new Checkit.FieldError('The sender Person is not owner of the sender Organization');
                  }
                });
              });
            }
          });

        },
        message: 'The sender Person is not owner of the sender Organization'
      }
    ],
    receiverEntityId: [
      'required',
      {
        rule: function(val) {
          var rule = this;

          return db('Entities')
            .where({
              id: val,
              is_anonymous: false
            }).then(function(receiverEntity) {
              if (receiverEntity.length === 0) {
                throw new Checkit.FieldError('receiverEntity doesn\'t exists!');
              }
            });
        }
      }
    ]
  },

  storage: (new Argon.Storage.Knex({
    tableName: 'MessageThreads'
  })),

  findByPerson: function findByPerson(person, callback) {
    var Model, request;

    Model = this;

    request = {
      action: 'findByPerson',
      model: Model,
      params: ['WHERE sender_person_id = ? OR receiver_entity_id = ?', [hashids.decode(person.id)[0], hashids.decode(person.id)[0]]],
      clauseType: 'whereRaw'
    };

    this.dispatch('beforeFindByPerson');

    this.storage.find(request, function(err, data) {
      callback(err, data);
      Model.dispatch('afterFindByPerson');
    });
  },

  /* MessageThread Factory.
   * @method findOrCreate
   * @property params <Object>
   *  {
   *    senderPerson : <Entity>,
   *    senderEntity : <Entity>,
   *    receiverEntity : <Entity>,
   *  }
   * @return null
   */
  findOrCreate: function findOrCreate(params, callback) {
    var messageThread;

    async.series([
      function(done) {
        db('MessageThreads')
          .where('sender_entity_id', 'in', [params.senderEntity.id, params.receiverEntity.id])
          .andWhere('receiver_entity_id', 'in', [params.senderEntity.id, params.receiverEntity.id])
          .asCallback(function(err, rows) {
            if (err) { return done(err); }

            var result = Argon.Storage.Knex.processors[0](rows);

            if (result.length < 1) {
              messageThread = new MessageThread({
                senderPersonId: params.senderPerson.id,
                senderEntityId: params.senderEntity.id,
                receiverEntityId: params.receiverEntity.id
              });
            } else {
              messageThread = new MessageThread(result[0]);
            }

            messageThread.hiddenForSender = false;
            messageThread.hiddenForReceiver = false;

            done();
          });
      },

      function(done) {
        messageThread.save(done);
      }
    ], function(err) {
      if (err) { return callback(err); }

      callback(null, messageThread);
    });
  },

  prototype: {
    senderPersonId: null,
    senderEntityId: null,
    receiverEntityId: null,
    hiddenForSender: false,
    hiddenForReceiver: false,
    lastSeenSender: null,
    lastSeenReceiver: null,

    init: function init(config) {
      Argon.KnexModel.prototype.init.call(this, config);

      var thread = this;

      this.bind('afterCreateMessage', function (msg) {
        // if message sender is the sender of thread
        if (msg.senderEntityId === thread.senderEntityId) {
          thread.lastSeenSender = new Date();
        // if message sender is the receiver of the thread
        } else if (msg.senderEntityId === thread.receiverEntityId) {
          thread.lastSeenReceiver = new Date();
        }

        thread.save(function (err) {
          if (err) { logger.error(err.stack); }
          logger.log('afterCreateMessage');
          logger.log('Thread ' + thread.id + ' updated');
          logger.log(thread);
        })
      });

      this.bind('afterDestroyMessage', function(data) {
        thread.save(function(err) {
          if (err) { logger.error(err.stack); }
          logger.log('afterDestroyMessage');
          logger.log('Thread ' + thread.id + ' updated');
          logger.log(thread);
        });
      });
    },

    isPersonSender: function isPersonSender(personId) {
      return personId === this.senderPersonId ? true : false;
    },

    getMessageCount: function getMessageCount(personId) {
      var count = 0;

      if (this.isPersonSender(personId)) {
        count = this.messageCountSender;
      } else {
        count = this.messageCountReceiver;
      }

      return count;
    },

    isHidden: function isHidden(personId) {
      var hidden = false;

      if (this.isPersonSender(personId)) {
        hidden = this.hiddenForSender;
      } else {
        hidden = this.hiddenForReceiver;
      }

      return hidden;
    },

    isActive: function isActive(callback) {
      var thread = this;

      User.find({entity_id: this.senderPersonId}, function(err, senderUser) {
        if (err) {
          return callback(err, null);
        }

        User.find({entity_id: thread.receiverEntityId}, function(err, receiverUser) {
          if (err) {
            return callback(err, null);
          }

          var active = (!senderUser[0].deleted && !receiverUser[0].deleted);

          return callback(null, active);
        });
      });
    },

    /* Message Factory.
     * @method createMessage
     * @property params <Object>
     *  {
     *    senderPersonId,
     *    type : //
     *    invitationRequestId,
     *    voiceId,
     *    message
     *  }
     * @return null
     */
    createMessage: function createMessage(params, callback) {
      if (!params || !(params instanceof Object)) {
        return callback('params is undefined!');
      }

      if (!this.id) {
        return callback('Can\'t create a message without a thread ID!');
      }

      params.threadId = this.id;

      if (this.isPersonSender(params.senderPersonId)) {
        params.senderEntityId = this.senderEntityId;
        params.receiverEntityId = this.receiverEntityId;
      } else {
        params.senderEntityId = this.receiverEntityId;
        params.receiverEntityId = this.senderEntityId;
      }

      if (!params.type) {
        params.type = 'message';
      }

      var message = new Message(params),
        thread = new MessageThread(this);

      thread.hiddenForSender = false
      thread.hiddenForReceiver = false

      thread.save(function (err) {
        if (err) { return callback(err) }

        message.save(function (err) {
          if (err) { return callback(err) }

          var messageInfo = {
            message: message,
            thread: thread
          }

          if (params.type === 'message') {
            return FeedInjector().injectNotification(message.senderEntityId, 'notifNewMessage', message, function (err) { callback(err, message); })
          } else if (params.type.match(/request_(voice|organization)/)) {
            return FeedInjector().injectNotification(message.senderEntityId, 'notifNewRequest', message, function (err) { callback(err, message); })
          } else if (params.type.match(/invitation_(voice|organization)/)) {
            return FeedInjector().injectNotification(message.senderEntityId, 'notifNewInvitation', message, function (err) { callback(err, message); })
          }
        });
      });
    },

    /* Has Many Messages Relationship
    */
    messages: function messages(whereClause, callback) {
      if (!this.id) {
        return callback(null, []);
      }

      whereClause = whereClause || {};

      whereClause.thread_id = this.id;

      Messages.find(whereClause, callback);
    }
  }
});

module.exports = MessageThread;
