// *** means it differs from original

K.MessagesPresenter = Module(K, 'MessagesPresenter')({

  build: function (messages, currentPerson) {
    return new Promise(function (resolve, reject) {
      if (!currentPerson) {
        throw new Error('K.MessagesPresenter requires the \'currentPerson\' argument')
      }

      var response = []

      async.eachLimit(messages, 1, function (message, nextMessage) {
        var msgInstance = new K.Message(message),
          isMsgSender = msgInstance.isPersonSender(hashids.decode(currentPerson.id)[0])

        // Skip if message is hidden
        /*
        if (message['hiddenFor' + (isMsgSender ? 'Sender' : 'Receiver')]) {
          return nextMessage()
        }
        */

        var fetchMessage, fetchCurrentPerson

        // Hashids

        msgInstance.id = hashids.encode(message.id)
        msgInstance.threadId = hashids.encode(message.threadId)

        // Other stuff

        Promise.resolve()
          .then(function () {
            return K.Message.query()
              .where('id', message.id)
              .include('senderEntity')
              .then(function (message) {
                fetchMessage = message[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            return K.Entity.query()
              .where('id', hashids.decode(currentPerson.id)[0])
              .then(function (entity) {
                fetchCurrentPerson = entity[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            return K.EntitiesPresenter.build([fetchMessage.senderEntity], null)
              .then(function (pres) {
                msgInstance.senderEntity = pres[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            if (!message.voiceId) {
              msgInstance.voice = null
              return Promise.resolve()
            }

            return K.Voice.query()
              .where('id', message.voiceId)
              .include('[slug,owner]')
              .then(function (voice) {
                msgInstance.voice = {
                  title: voice[0].title,
                  slug: voice[0].slug.url,
                  owner: {
                    profileName: voice[0].owner.profileName,
                  },
                }

                return Promise.resolve()
              })
          })
          .then(function () {
            if (!message.organizationId) {
              msgInstance.organization = null
              return Promise.resolve()
            }

            return K.Entity.query()
              .where('id', message.organizationId)
              .then(function (org) {
                msgInstance.organization = {
                  name: org[0].name,
                  profileName: org[0].profileName,
                }

                return Promise.resolve()
              })
          })
          .then(function () {
            delete msgInstance.invitationRequestId
            delete msgInstance.reportId
            delete msgInstance.voiceId
            delete msgInstance.organizationId
            delete msgInstance.senderPersonId
            delete msgInstance.senderEntityId
            delete msgInstance.receiverEntityId
            delete msgInstance.hiddenForSender
            delete msgInstance.hiddenForReceiver

            response.push(msgInstance)

            return nextMessage()
          })
          .catch(nextMessage)
      }, function (err) {
        if (err) { return reject(err) }

        return resolve(response)
      })
    })
  },

})

module.exports = K.MessagesPresenter
