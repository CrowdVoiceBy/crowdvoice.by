var PagesController = Class('PagesController')({
  prototype : {

    about : function index (req, res, next) {
      res.render('pages/about.html', {
        layout : 'application'
      });
    }

  }
});

module.exports = new PagesController();
