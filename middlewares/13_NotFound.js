module.exports = function(req, res) {
  res.format({
    html : function() {
      res.status(404);
      res.render('shared/404.html', {layout: 'systemStatus', message : "Oops, the page you’re looking for does not exist."});
    },
    json : function() {
      res.status(404);
      res.json({layout: 'systemStatus', error : 'Not Found'});
    }
  })

};
