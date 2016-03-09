'use strict'

var request = require('superagent'),
  urlBase = 'http://localhost:3000'

module.exports = function (username, callback) {
  var csrf,
    agent = request.agent()

  async.series([
    function (next) {
      agent
        .get(urlBase + '/csrf')
        .end(function (err, res) {
          if (err) { return callback(err) }

          csrf = res.text

          return next()
        })
    },

    function (next) {
      agent
        .post(urlBase + '/session')
        .send({
          _csrf: csrf,
          username: username,
          password: '12345678'
        })
        .end(function (err, res) {
          if (err) { return callback(err) }

          return next()
        })
    },
  ], function (err) {
    if (err) { return callback(err) }

    return callback(null, agent, csrf)
  })
}
