'use strict'

var request = require('superagent'),
  Promise = require('bluebird')

var urlBase = 'http://localhost:3000'

module.exports = function (username) {
  return new Promise(function (resolve, reject) {
    var csrf,
      agent = request.agent()

    async.series([
      function (next) {
        agent
          .get(urlBase + '/csrf')
          .accept('application/json')
          .end(function (err, res) {
            if (err) { return reject(err) }

            csrf = res.body

            return next()
          })
      },

      function (next) {
        agent
          .post(urlBase + '/session')
          .send({
            _csrf: csrf,
            username: username,
            password: '12345678',
          })
          .end(function (err, res) {
            if (err) { return reject(err) }

            return next()
          })
      },
    ], function (err) {
      if (err) { return reject(err) }

      return resolve({
        agent: agent,
        csrf: csrf,
      })
    })
  })
}
