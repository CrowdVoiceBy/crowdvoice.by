/* jshint multistr: true */
var Checkit = require('checkit');

Class(CV, 'FormUtils').inherits(Widget)({

	ELEMENT_CLASS : 'cv-login',

    HTML : '\
        <div></div>\
    ',

    prototype        : {

        formType    : null,
        formAction  : null,
        formToken   : null,
        formEl      : null,
        errorsEl    : null,
        buttonEl    : null,

        init : function(config){
            Widget.prototype.init.call(this, config);


        },


        validate: function(options, body){
          var result = {};

          checkit = new Checkit(options);

          var formValidation = checkit.validateSync(body);

          var validForm = formValidation[1];
          var formErrors = formValidation[0];

          if (!validForm){
            result['isValid'] = false;
            result['errors'] = formErrors;
          }else{
            result['isValid'] = true;
            result['errors'] = null;
          }

          return result;

        }

    }

});










