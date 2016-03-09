require('./lib/bootstrap');

// Load base boot.js if exists
if (fs.existsSync(path.join(global.cwd, '/lib/boot.js'))) {
  require(path.join(global.cwd, '/lib/boot.js'));
}

var application;

global.application = application = require('./lib/Application');

application.loadControllers();

module.exports = application;
