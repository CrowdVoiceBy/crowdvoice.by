K.ThreadsPresenter = Module(K, 'ThreadsPresenter')({

  build: function (threads, currentPerson) {
    return new Promise(function (resolve, reject) {
      if (!currentPerson) {
        throw new Error('K.ThreadsPresenter requires the \'currentPerson\' argument')
      }

      var response = []

      async.eachLimit(threads, 1, function (thread, nextThread) {
        var threadInstance = new K.MessageThread(thread),
           isThreadSender = threadInstance.isPersonSender(hashids.decode(currentPerson.id)[0])

        // Skip if thread is hidden
        if (thread['hiddenFor' + (isThreadSender ? 'Sender' : 'Receiver')]) {
          return nextThread()
        }

        var fetchThread, fetchCurrentPerson

        // Hashids

        threadInstance.id = hashids.encode(thread.id)

        // Other stuff

        Promise.resolve()
          .then(function () {
            return K.MessageThread.query()
              .where('id', thread.id)
              .include('[messages,senderEntity,receiverEntity]')
              .then(function (thread) {
                fetchThread = thread[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            return K.Entity.query()
              .where('id', hashids.decode(currentPerson.id)[0])
              .include('organizations')
              .then(function (entity) {
                fetchCurrentPerson = entity[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            threadInstance.lastSeen = thread['lastSeen' + (isThreadSender ? 'Sender' : 'Receiver')]

            return Promise.resolve()
          })
          .then(function () {
            threadInstance.totalMessages = fetchThread.messages.filter(function (m) {
              var isMsgSender = m.isPersonSender(fetchCurrentPerson.id)

              return m['hiddenFor' + isMsgSender ? 'Sender' : 'Receiver']
            }).length

            return Promise.resolve()
          })
          .then(function () {
            var result = 0

            return Promise.each(fetchThread.messages,
              function (message) {
                var isMsgSender = message.isPersonSender(fetchCurrentPerson.id)

                if (message['hiddenFor' + isMsgSender ? 'Sender' : 'Receiver']) {
                  return Promise.resolve()
                }

                if (!isMsgSender) { // i.e. is receiver
                  if (threadInstance.lastSeen === null) {
                    result += 1
                  } else if (moment(message.createdAt).format('X') > moment(threadInstance.lastSeen).format('X')) {
                    result += 1
                  }
                }

                return Promise.resolve()
              })
              .then(function () {
                threadInstance.unreadCount = result

                return Promise.resolve()
              })
          })
          .then(function () {
            return K.EntitiesPresenter.build([fetchThread.senderEntity], null)
              .then(function (pres) {
                threadInstance.senderEntity = pres[0]

                if (fetchThread.senderEntity.type === 'person') {
                  threadInstance.senderPerson = pres[0]
                }

                return Promise.resolve()
              })
              .then(function () {
                if (threadInstance.senderPerson) {
                  return Promise.resolve()
                }

                return fetchThread.senderEntity.getOwner()
                  .then(function (owner) {
                    return K.EntitiesPresenter.build([owner], null)
                  })
                  .then(function (pres) {
                    threadInstance.senderPerson = pres[0]

                    return Promise.resolve()
                  })
              })
          })
          .then(function () {
            return K.EntitiesPresenter.build([fetchThread.receiverEntity], null)
              .then(function (pres) {
                threadInstance.receiverEntity = pres[0]

                return Promise.resolve()
              })
          })
          .then(function () {
            if (!thread.messages) {
              return Promise.resolve()
            }

            return K.MessagesPresenter.build(thread.messages, currentPerson)
              .then(function (pres) {
                // sorting has to be done because relation's orderBy may not be
                // implemented in Krypton yet
                threadInstance.messages = pres.sort(function (a, b) {
                  return new Date(a.createdAt) - new Date(b.createdAt)
                })

                return Promise.resolve()
              })
          })
          .then(function () {
            if (threadInstance.messages) {
              return Promise.resolve()
            }

            return K.Message.query()
              .where('thread_id', thread.id)
              .orderBy('created_at', 'desc')
              .limit(1)
              .then(function (messages) {
                threadInstance.latestMessageContent = messages[0].message

                return Promise.resolve()
              })
          })
          .then(function () {
            delete threadInstance.lastSeenSender
            delete threadInstance.lastSeenReceiver
            delete threadInstance.hiddenForSender
            delete threadInstance.hiddenForReceiver
            delete threadInstance.senderPersonId
            delete threadInstance.senderEntityId
            delete threadInstance.receiverEntityId

            response.push(threadInstance)

            return nextThread()
          })
          .catch(nextThread)
      }, function (err) {
        if (err) { return reject(err) }

        return resolve(response)
      })
    })
  },

})

module.exports = K.ThreadsPresenter
