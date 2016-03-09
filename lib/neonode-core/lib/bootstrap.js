global.path = require('path');
global.cwd 	= process.cwd();
global.fs 	= require('fs');

var configFile = path.join(global.cwd, '/config/config.js');

if (fs.existsSync(configFile)) {
  global.CONFIG = require(configFile);
} else {
  console.error('Create ./config/config.js first!');
  process.exit();
}


// *************************************************************************
//                        Cobalt Logger
// *************************************************************************
if (!fs.existsSync('./log')) {
    fs.mkdirSync('./log', 0744);
}

global.logger = require('./logger');

require('./db');

require('neon');
require('neon/stdlib');
require('thulium'); // Ultra fast templating engine. See https://github.com/escusado/thulium

require('argonjs'); // Async ActiveRecord for ECMAScript https://github.com/azendal/argon

// *************************************************************************
//                        Error monitoring for neon
// *************************************************************************
if (CONFIG.enableLithium) {
  require('./vendor/lithium');
}

require('fluorine');

global.express        = require('express');
global.http           = require('http');
global.glob           = require('glob');
global.inflection     = require('inflection');
global.bodyParser     = require('body-parser');
global.cookieParser   = require('cookie-parser');
global.expressSession = require('express-session');
global.csrf           = require('csurf');
global.morgan         = require('morgan');
global.bcrypt         = require('bcrypt-nodejs');
global.flash          = require('req-flash');
global._s             = require('underscore.string');
global.async          = require('async');

// Validations for /lib/models/ValidationSupport.js
global.Checkit        = require('checkit');

if (CONFIG.enableHashids) {
  var Hashids           = require('hashids');
  global.hashids        = new Hashids(CONFIG.sessionSecret, 12);
}

if (CONFIG.enablePassport) {
  global.passport     = require('passport');
}
