/**
 * THIS MODEL IS NOT COMPLETE.  DO NOT USE IT TO CREATE RECORDS.  JUST USE IT
 * FOR FETCHING RELATIONS.
 *
 * NO TESTS HAVE BEEN WRITTEN EITHER.
 */

'use strict'

K.Message = Class(K, 'Message').inherits(Krypton.Model)({
  tableName: 'Messages',

  attributes: [
    'id',
    'type',
    'senderPersonId',
    'senderEntityId',
    'receiverEntityId',
    'threadId',
    'invitationRequestId',
    'voiceId',
    'organizationId',
    'message',
    'hiddenForSender',
    'hiddenForReceiver',
    'createdAt',
    'updatedAt',
    'reportId'
  ],

  validations: {
    reportId: [], // TODO make required if type == report

    type: [
      'required',
      {
        rule: function (val) {
          if (!val.match(/(report|message|request_(voice|organization)|invitation_(voice|organization|accepted_voice|accepted_organization|rejected_voice|rejected_organization))/)) {
            throw new Checkit.FieldError('Message type is invalid')
          }
        },
        message: 'Message type is invalid'
      }
    ],

    threadId: [
      'required',
      {
        rule: function (val) {
          return K.MessageThread.query()
            .where('id', val)
            .then(function (thread) {
              if (thread.length < 1) {
                throw new Checkit.FieldError('Thread doesn\'t exist')
              }
            })
        },
        message: 'Thread doesn\'t exist'
      },
      {
        rule: function (val) {
          var rule = this

          return K.MessageThread.query()
            .where('sender_entity_id', 'in', [rule.target.senderEntityId, rule.target.receiverEntityId])
            .andWhere('receiver_entity_id', 'in', [rule.target.senderEntityId, rule.target.receiverEntityId])
            .then(function (thread) {
              if (thread.length < 1) {
                throw new Checkit.FieldError('Thread doesn\'t exists')
              }

              var isThreadParticipant = false

              if (thread.filter(function (t) { return t.id === val }).length > 0) {
                isThreadParticipant = true
              }

              if (!isThreadParticipant) {
                throw new Checkit.FieldError('Message participants are not part of the thread')
              }
          })
        },
        message: 'Message participants are not part of the thread'
      }
    ],

    senderPersonId: [
      'required',
      {
        rule: function (val) {
          return K.Entity.query()
            .where('id', val)
            .then(function (senderPerson) {
              if (senderPerson.length < 1) {
                throw new Checkit.FieldError('senderPerson doesn\'t exist')
              }
            })
        },
        message: 'senderPerson doesn\'t exist'
      },
      {
        rule: function (val) {
          return K.Entity.query()
            .where('id', val)
            .then(function (senderPerson) {
              if (senderPerson.length < 1) {
                throw new Checkit.FieldError('senderPerson doesn\'t exist')
              }

              senderPerson = senderPerson[0]

              if (senderPerson.type !== 'person') {
                throw new Checkit.FieldError('senderPerson is not of type person')
              }
            })
        },
        message: 'senderPerson is not of type person'
      },
      {
        rule: function (val) {
          return K.User.query()
            .where('entity_id', val)
            .then(function (senderUser) {
              if (senderUser.length < 1) {
                throw new Checkit.FieldError('senderPerson user doesn\'t exist')
              }

              senderUser = senderUser[0]

              if (senderUser.deleted) {
                throw new Checkit.FieldError('senderPerson\'s user has been deleted')
              }
            })
        },
        message: 'senderPerson\'s user has been deleted'
      }
    ],

    senderEntityId: [
      'required',
      {
        rule: function (val) {
          return K.Entity.query()
            .where('id', val)
            .then(function (senderEntity) {
              if (senderEntity.length < 1) {
                throw new Checkit.FieldError('senderEntity doesn\'t exist')
              }
            })
        },
        message: 'senderEntity doesn\'t exist'
      },
      {
        rule: function (val) {
          return K.Entity.query()
            .where('id', val)
            .then(function (senderEntity) {
              if (senderEntity.length < 1) {
                throw new Checkit.FieldError('senderEntity doesn\'t exist')
              }

              senderEntity = senderEntity[0]

              if (senderEntity.type === 'person') {
                return K.User.query()
                  .where('entity_id', val)
                  .then(function (senderEntityUser) {
                    if (senderEntityUser.length < 1) {
                      throw new Checkit.FieldError('senderEntity\'s user doesn\'t exist')
                    }

                    senderEntityUser = senderEntityUser[0]

                    if (senderEntityUser.deleted) {
                      throw new Checkit.FieldError('senderEntity\'s user has been deleted')
                    }
                  })
              }
            })
        },
        message: 'senderEntity\'s user has been deleted'
      },
      {
        rule: function (val) {
          var rule = this

          return K.Entity.query()
            .where('id', val)
            .then(function (senderEntity) {
              if (senderEntity.length < 1) {
                throw new Checkit.FieldError('senderEntity doesn\'t exist')
              }

              senderEntity = senderEntity[0]

              if (senderEntity.type === 'person') {
                if (senderEntity.id !== rule.target.senderPersonId) {
                  throw new Checkit.FieldError('senderEntity is of type person and is not = to senderPerson')
                }
              }
            })
        },
        message: 'senderEntity is of type person and is not = to senderPerson'
      },
      {
        rule: function (val) {
          var rule = this

          return K.Entity.query()
            .where('id', val)
            .then(function (senderEntity) {
              if (senderEntity.length < 1) {
                throw new Checkit.FieldError('senderEntity doesn\'t exist')
              }

              senderEntity = senderEntity[0]

              if (senderEntity.type === 'organization') {
                return K.Entity.query()
                  .where('id', rule.target.senderPersonId)
                  .include('organizations')
                  .then(function (senderPerson) {
                    if (senderPerson.length < 1) {
                      throw new Checkit.FieldError('senderPerson doesn\'t exist')
                    }

                    senderPerson = senderPerson[0]

                    if (senderPerson.organizations.filter(function (o) {
                      return o.id === senderEntity.id
                    }).length < 1) {
                      throw new Checkit.FieldError('The sender Person is not owner of the sender Organization')
                    }
                  })
              }
            })
        },
        message: 'The sender Person is not owner of the sender Organization'
      }
    ],

    receiverEntityId: [
      'required',
      {
        rule: function (val) {
          K.Entity.query()
            .where('id', val)
            .then(function (receiverEntity) {
              if (receiverEntity.length < 1) {
                throw new Checkit.FieldError('receiverEntity doesn\'t exist')
              }
            })
        },
        message: 'receiverEntity doesn\'t exist'
      },
      {
        rule: function (val) {
          K.Entity.query()
            .where('id', val)
            .then(function (receiverEntity) {
              if (receiverEntity.length < 1) {
                throw new Checkit.FieldError('receiverEntity doesn\'t exist')
              }

              receiverEntity = receiverEntity[0]

              if (receiverEntity.type === 'person') {
                return K.User.query()
                  .where('entity_id', val)
                  .then(function (receiverUser) {
                    if (receiverUser.length < 1) {
                      throw new Checkit.FieldError('receiverEntity\'s user doesn\'t exist')
                    }

                    receiverUser = receiverUser[0]

                    if (receiverUser.deleted) {
                      throw new Checkit.FieldError('receiverEntity\'s user has been deleted')
                    }
                  })
              }
            })
        },
        message: 'receiverEntity\'s user has been deleted'
      }
    ],

    invitationRequestId: [
      {
        rule: function (val) {
          if (rule.target.type.match(/(invitation_(voice|organization))/)) {
            if (!val) {
              throw new Checkit.FieldError('invitationRequestId is requiered for message of type invitation_(voice|organization)')
            }
          }
        },
        message: 'invitationRequestId is requiered for message of type invitation_(voice|organization)'
      }
    ],

    voiceId: [
      {
        rule: function (val) {
          if (rule.target.type.match(/((request|invitation)_voice)/)) {
            if (!val) {
              throw new Checkit.FieldError('voiceId is requiered for message of type (request|invitation)_voice')
            }
          }
        },
        message: 'voiceId is requiered for messages of type (request|invitation)_voice'
      },
      {
        rule: function (val) {
          return K.Voice.query()
            .where('id', val)
            .then(function (voice) {
              if (voice.length < 1) {
                throw new Checkit.FieldError('This message.voiceId doesn\'t exists')
              }
            })
        },
        message: 'This message.voiceId doesn\'t exists'
      }
    ],

    organizationId: [
      {
        rule: function (val) {
          if (rule.target.type.match(/((request|invitation)_organization)/)) {
            if (!val) {
              throw new Checkit.FieldError('organizationId is required for mesagges of type (request|invitation)_organization')
            }
          }
        },
        message: 'organizationId is required for mesagges of type (request|invitation)_organization'
      },
      {
        rule: function (val) {
          return K.Entity.query()
            .where('id', val)
            .andWhere('type', 'organization')
            .then(function (organization) {
              if (organization.length < 1) {
                throw new Checkit.FieldError('This message.organizationId doesn\'t exists')
              }
            })
        },
        message: 'This message.organizationId doesn\'t exists'
      }
    ],

    message: ['required'],
  },

  TYPE_MESSAGE: 'message',
  TYPE_REQUEST_VOICE: 'request_voice',
  TYPE_REQUEST_ORGANIZATION: 'request_organization',
  TYPE_INVITATION_VOICE: 'invitation_voice',
  TYPE_INVITATION_ORGANIZATION: 'invitation_organization',
  TYPE_INVITATION_ACCEPT_VOICE: 'invitation_accept_voice',
  TYPE_INVITATION_ACCEPT_ORGANIZATION: 'invitation_accept_organization',
  TYPE_INVITATION_REJECT_VOICE: 'invitation_reject_voice',
  TYPE_INVITATION_REJECT_ORGANIZATION: 'invitation_reject_organization',

  prototype: {
    type: 'message',
    voiceId: false,
    organizationId: false,
    hiddenForSender: false,
    hiddenForReceiver: false,

    isPersonSender: function (personId) {
      return personId === this.senderPersonId
    }
  }
})

module.exports = new K.Message()
