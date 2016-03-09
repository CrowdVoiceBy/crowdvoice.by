// Admin.EntitiesController = require(path.join(process.cwd(), '/controllers/admin/EntitiesController.js'));

Admin.OrganizationsController = Class(Admin, 'OrganizationsController').inherits(Admin.EntitiesController)({
  prototype : {
    setType : function setType(req, res, next) {
      req.entityType = 'organization';
      next();
    },
  }
});

module.exports = new Admin.OrganizationsController();
