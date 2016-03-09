logger.info("Loading Method Override");

var methodOverride = require('method-override');
module.exports = methodOverride('_method');
