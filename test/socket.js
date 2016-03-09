// This file tests the socket related stuff

'use strict'

var application = require('neonode-core')
require(path.join(__dirname, '../lib/routes.js'))

// Load socket.io
var io = require('socket.io')(application.server);

// Load moment
global.moment = require('moment')

global.FeedInjector = require(path.join(__dirname, '../lib/FeedInjector.js'))
require(path.join(__dirname, '../presenters/PostsPresenter'))

application._serverStart()

io.use(function(socket, next) {
  sessionMiddleWare(socket.request, socket.request.res, next);
});

io.on('connection', require(path.join(process.cwd(), 'lib/socket.js')));

// COMMENT IF YOU WANT LOGGER OUTPUT
logger.info = function () {}

var expect = require('chai').expect,
  socket = require('socket.io-client')('http://localhost:3000');

CONFIG.database.logQueries = false

var urlBase = 'http://localhost:3000'

describe('Sockets', function () {

  describe('getStats', function () {

    it('Should count voice locations as well as entities locations', function (doneTest) {
      socket.emit('getStats')

      socket.on('stats', function (stats) {
        expect(parseInt(stats.cities)).to.equal(13)

        return doneTest()
      })
    })

  })

})
