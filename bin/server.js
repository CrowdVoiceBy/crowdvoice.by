#!/usr/bin/env node
var path = require('path');

var application = require(path.join(process.cwd(), 'lib', 'neonode-core'));

// Argon Monkey patches
require(__dirname + '/../lib/ArgonPatches');

// Load socket.io
var io = require('socket.io')(application.server);

global.FeedInjector = require(path.join(process.cwd(), 'lib', 'FeedInjector.js'));

require(path.join(process.cwd(), 'lib', 'krypton', 'load-models.js'));

require(path.join(process.cwd(), 'lib', 'routes.js'));

require(path.join(process.cwd(), 'lib', 'TwitterFetcher.js'));

require('glob').sync('lib/krypton/presenters/*.js').forEach(function (file) {
  logger.log('Loading ' + file + '...')
  require(path.join(process.cwd(), file))
})

require('glob').sync('presenters/*.js').forEach(function (file) {
  logger.log('Loading ' + file + '...')
  require(path.join(process.cwd(), file))
})

application._serverStart();

io.use(function(socket, next) {
  sessionMiddleWare(socket.request, socket.request.res, next);
});

io.on('connection', require(path.join(process.cwd(), 'lib/socket.js')));
