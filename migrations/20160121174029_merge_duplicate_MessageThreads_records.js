var _ = require('underscore')

exports.up = function(knex, Promise) {
  return knex('Entities')
    .where('type', '=', 'organization')
    .then(function (organizations) {
      if (organizations.length < 1) {
        return Promise.resolve()
      }

      return Promise.all(organizations.map(function (organization) {
        return knex('MessageThreads')
          .where('receiver_entity_id', '=', organization.id)
          .then(function (organizationThreads) {
            var senderIds = organizationThreads.map(function (t) { return t.sender_entity_id })

            return knex('MessageThreads')
              .where('sender_entity_id', '=', organization.id)
              .andWhere('receiver_entity_id', 'in', senderIds)
          })
          .then(function (duplicateThreads) {
            if (duplicateThreads.length < 1) {
              return Promise.resolve()
            }

            return Promise.all(duplicateThreads.map(function (duplicateThread) {
              return knex('MessageThreads')
                .where('receiver_entity_id', '=', duplicateThread.sender_entity_id)
                .andWhere('sender_entity_id', '=', duplicateThread.receiver_entity_id)
                .then(function (newThread) {
                  return knex('Messages')
                    .where('thread_id', '=', duplicateThread.id)
                    .update('thread_id', newThread[0].id)
                })
                .then(function () {
                  return knex('MessageThreads')
                    .where('id', '=', duplicateThread.id)
                    .delete()
                })
            }))
          })
      }))
    })
}

exports.down = function(knex, Promise) {
  return Promise.resolve()
}
