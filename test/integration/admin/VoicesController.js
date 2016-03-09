'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.log = function () {}

var expect = require('chai').expect,
  login = require(path.join(process.cwd(), 'test', 'integration', 'login-promise.js'))

var urlBase = 'http://localhost:3000'

describe('Admin.VoicesController', function () {

  describe('#update', function () {

    it('Shouldn\'t return 500 when a Voice without the requirements is published and you send update', function (doneTest) {
      login('cersei-lannister')
        .then(function (r) {
          r.agent
            .put(urlBase + '/admin/voices/' + hashids.encode(1)) // Blackwater
            .accept('application/json')
            .send({
              _csrf: r.csrf,
              image: 'undefined',
              title: 'The Battle of the Blackwater',
              slug: 'blackwater-battle',
              description: 'The Battle of the Blackwater is the largest battle in the War of the Five Kings.',
              topics: '8ZnLyQLgNaME,5q7WBDqgOlG8',
              type: 'TYPE_PUBLIC',
              twitterSearch: null,
              locationName: 'Mouth of the Blackwater Rush',
              latitude: '4.815',
              longitude: '162.342',
              anonymously: 'false',
              ownerId: hashids.encode(1), // Tyrion
            })
            .end(function (err, res) {
              expect(res.status).to.equal(200)

              return doneTest()
            })
        })
        .catch(doneTest)
    })

  })

})
