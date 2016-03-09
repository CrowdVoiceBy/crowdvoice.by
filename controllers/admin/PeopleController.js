// Admin.EntitiesController = require(path.join(process.cwd(), '/controllers/admin/EntitiesController.js'));

Admin.PeopleController = Class(Admin, 'PeopleController').inherits(Admin.EntitiesController)({
  prototype : {
    setType : function setType(req, res, next) {
      req.entityType = 'person';
      next();
    }
  }
});

module.exports = new Admin.PeopleController();
