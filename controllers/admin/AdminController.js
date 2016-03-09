var BlackListFilter = require(path.join(process.cwd(), '/controllers/BlackListFilter.js'));

var AdminController = Class(Admin, 'AdminController').includes(BlackListFilter)({
  prototype : {
    index : function index(req, res, next) {
      ACL.isAllowed('index', 'admin', req.role, { currentPerson: req.currentPerson }, function(err, isAllowed) {
        if (err) { return next(err); }

        if (!isAllowed) {
          return next(new ForbiddenError())
        }

        res.render('admin/index.html', { layout : 'admin' });
      })
    }
  }
});
