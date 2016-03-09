var multer = require('multer');

module.exports = multer({
  dest: '/tmp',
  includeEmptyFields: true
});
