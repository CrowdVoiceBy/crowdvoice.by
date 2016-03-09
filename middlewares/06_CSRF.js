// *************************************************************************
//                          CSRF
// *************************************************************************
logger.info("Setting CSRF");

if (CONFIG.enableRedis) {
  module.exports = global.csrf();
} else {
  module.exports = function(req, res, next) {
    next();
  }
}
