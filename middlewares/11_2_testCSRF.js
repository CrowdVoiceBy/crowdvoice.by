logger.info("Setting test for csrf");

if (process.env.NODE_ENV === 'test') {
  module.exports = function (req, res, next) {
    if (req.path !== '/csrf') {
      return next();
    }

    res.format({
      html: function () {
        res.send(res.locals.csrfToken);
      },
      json: function () {
        res.json(res.locals.csrfToken);
      }
    });
  };
} else {
  module.exports = function(req, res, next) {
    next();
  }
}
