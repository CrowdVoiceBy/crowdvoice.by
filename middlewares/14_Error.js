module.exports = function(err, req, res, next) {

  logger.info('Route: ' + req.route.path);

  req.route.stack.forEach(function(item) {
    logger.info('Method: ' + item.method);
    logger.info('Params: ' + item.params);
    logger.info('-------------------------------' + "\n");
  });

  logger.error(err, err.stack);

  if (err.errors) {
    logger.info(err.errors);
  }

  res.format({
    html : function() {
      if (err.name && err.name === 'NotFoundError') {
        return res.status(404).render('shared/404.html', {layout : 'systemStatus', message : err.message});
      }

      if (err.name && err.name === 'ForbiddenError') {
        return res.status(403).render('shared/403.html', {layout : 'systemStatus', message : err.message});
      }

      res.status(500);
      res.render('shared/500.html', {layout : 'systemStatus', error : err.stack})
    },
    json : function() {
      if (err.name && err.name === 'NotFoundError') {
        return res.status(404).json({error : err.message});
      }

      if (err.name && err.name === 'ForbiddenError') {
        return res.status(403).json({error : err.message});
      }

      res.status(500);
      res.json({error : err.stack})
    }
  })

}
