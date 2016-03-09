/* jshint multistr: true */
var Checkit = require('checkit');

Class(CV, 'Login').inherits(Widget)({

	ELEMENT_CLASS : 'cv-login',

    HTML : '\
        <div class="cv-login">\
          <div class="close-login">\
            <img src="/img/icons/icon-close.png">\
          </div>\
          <div class="login-content">\
            <a href="/" class="logo -tdn">\
                <svg class="cv-main-logo__svg">\
                    <use xlink:href="#svg-logo"></use>\
                </svg>\
            </a>\
            <div class="cv-login__logo-type -font-bold -color-black">CrowdVoice.by</div>\
            <div class="form-errors"></div>\
            <div class="form-container"></div>\
          </div>\
        </div>\
    ',

    FORM_SIGNUP : '\
        <div class="cv-login__heading -font-light">Amplify your cause!</div>\
        <p class="-mb3">Sign up and create Voices, post content, follow users, organizations and more!</p>\
        <form action="" method="post" accept-charset="utf-8">\
            <div class="form-field">\
                <input type="email" class="ui-input -lg -block email" name="email" value="" placeholder="Your Email">\
            </div>\
            <div class="form-field">\
                <input type="password" class="ui-input -lg -block password" name="password" value="" placeholder="Your Password">\
            </div>\
            <div class="form-field -row">\
                <div class="-col-4">\
                    <span class="cv-login__profile-handler-pre">http://crowdvoice.by/</span>\
                </div>\
                <div class="-col-8">\
                    <input type="text" class="ui-input -lg -block profileName" name="profileName" value="" placeholder="profile-name">\
                </div>\
            </div>\
            <input type="hidden" name="_csrf" class="form-token" value="">\
            <button class="cv-button primary -m0 -block">Sign Up Now!</button>\
        </form>\
        <p class="cv-login__bottom-help-text">Already have an account? <a href="/login">Sign in!</a></p>\
    ',

    FORM_LOGIN : '\
        <div class="cv-login__heading -font-light">Welcome back! :)</div>\
        <br>\
        <form action="" method="post" accept-charset="utf-8">\
            <div class="input-pair">\
              <div class="form-field">\
                <div class="cv-input">\
                  <input type="text" class="username" name="username" value="" placeholder="EMAIL or PROFILE NAME" autofocus>\
                </div>\
              </div>\
              <div class="form-field">\
                <div class="cv-input">\
                  <input type="password" class="password" name="password" value="" placeholder="PASSWORD">\
                </div>\
              </div>\
            </div>\
            <div class="-col-6">\
              <div class="cv-check">\
                <input type="checkbox" class="input-checkbox" name="rememberme" value="false">\
                <span class="label">Remember me (?)</span>\
              </div>\
            </div>\
            <div class="-col-6">\
              <a href="/session/forgot-password">Forgot your password?</a>\
            </div>\
            <br><br>\
            <input type="hidden" name="_csrf"  class="form-token" value="">\
            <button class="cv-button primary -m0 -block">Sign In</button>\
        </form>\
        <p class="cv-login__bottom-help-text">Don\'t have an account yet? <a href="/signup">Sign Up!</a></p>\
    ',

    FORM_FORGOT_PASSWORD : '\
      <div class="cv-login__heading -font-light">It\'s ok. It happens.</div>\
      <p style="width: 400px; margin: 0 auto; margin-bottom: 3em;">Please enter the email address you used to sign up and we will send you instructions to reset your password to gain back access to CrowdVoice.by.</p>\
      <form action="" method="post" accept-charset="utf-8">\
        <div class="form-field">\
          <input type="email" class="ui-input -lg -block email" name="email" placeholder="Your Email">\
        </div>\
        <input type="hidden" name="_csrf" class="form-token" value="">\
        <button class="cv-button primary -m0 -block">Submit</button>\
      </form>\
    ',

    FORM_RESET_PASSWORD : '\
      <p class="cv-login__heading -font-light">Type in a new password.</p>\
      <p>This time make sure you choose something you will remember.<br>\
      Actually, you might want to read <a href="#">this article</a>. It will help :)</p>\
      <br>\
      <form action="" method="post" accept-charset="utf-8">\
        <div class="form-field">\
          <div class="reset-password-input">\
            <input name="password" type="password" class="ui-input -lg -block password" placeholder="Your new password">\
          </div>\
        </div>\
        <div class="cv-check">\
          <input type="checkbox" class="reset-password-checkbox">\
          <span class="label">Show your password to make sure you typed it correctly.</span>\
        </div>\
        <br><br>\
        <input type="hidden" name="_csrf" class="form-token" value="">\
        <button class="cv-button primary -m0 -block">Reset Password</button>\
      </form>\
    ',

    prototype        : {

        formType    : null,
        formAction  : null,
        formToken   : null,
        formEl      : null,
        errorsEl    : null,
        buttonEl    : null,
        loginError  : null,

        init : function(config){
            Widget.prototype.init.call(this, config);
            var login = this;
            var closeEl = this.element.find('.close-login');
            this.errorsEl = this.element.find('.form-errors');

            if (this.loginError && this.loginError.error){
              login.errorsEl.show();
              login.errorsEl.append('<p>' + this.loginError.error + '</p>');
            }

            var formElem;

            switch(this.formType) {
                case 'signup':
                    formElem = this.constructor.FORM_SIGNUP;
                    break;
                case 'login':
                    formElem = this.constructor.FORM_LOGIN;
                    break;
                case 'forgot-password':
                    formElem = this.constructor.FORM_FORGOT_PASSWORD;
                    break;
                case 'reset-password':
                    formElem = this.constructor.FORM_RESET_PASSWORD;
                    break;
                default:
                    //¯\_(ツ)_/¯
            }

            this.element.find('.form-container').append(formElem);
            this.element.find('form').attr('action', this.formAction);
            this.element.find('.form-token').attr('value', this.formToken);

            this.buttonEl = this.element.find('button');
            this.formEl = this.element.find('form');
            this.checkEl = this.element.find('.reset-password-checkbox');

            this.errors = {};

            if (this.formType === 'signup') {

              this.element.find("input.profileName").blur(function() {
                  var pValue = $(this).val().toLowerCase().replace(/ /g, "-");
                  $(this).val(pValue).change();
              });

              this.formEl.find('.profileName').on('keyup input paste', function(e) {
                var profileNameText = ($(e.target).val()).trim();
                $.ajax({
                  type: "POST",
                  url: '/signup/isProfileNameAvailable',
                  headers: { 'csrf-token': login.formToken },
                  data: { profileName : profileNameText },
                  success: function(data) {
                    //{status: "available/taken"}
                    login.validateFields(data.status, 'profileName', '<p><b>Profilename</b> is already taken.</p>');
                  },
                  dataType: 'json',
                });
              });
            }

            setTimeout(function(){
                login.show();
            }, 0);

            closeEl.on('click', function(){
              window.location.href = '/';
            });

            this.buttonEl.on("click",function(e){
                e.preventDefault();
                var formValidation = login.validate();
                console.log('form');
                console.log(formValidation);
                var validForm = formValidation[1];
                var formErrors = formValidation[0];

                if (!validForm){

                  login.errorsEl.empty();
                  login.errorsEl.show();

                  for (var error in formErrors.errors) {
                      var replaceStr = error;
                      var errorStr = formErrors.errors[error].message.replace(replaceStr, '<b>'+replaceStr+'</b>');
                      login.errorsEl.append('<p>' + errorStr + '</p>')
                  }

                  return false;
                  e.preventDefault;

                }else{
                  login.formEl.submit();
                }
            });

            this.checkEl.on('click', function(){
              if ( this.checked ) {
                login.element.find('.reset-password-input input').attr('type', 'text');
              } else {
                login.element.find('.reset-password-input input').attr('type', 'password');
              }
              login.element.find('.reset-password-input input')[0].focus();
            });
        },

        validateFields : function(status, fieldType, message){
          console.log('fields');
          var login = this;
          var messages = {
            username: "<p><b>Username</b> is already taken.</p>",
            profileName : "<p><b>Profilename</b> is already taken.</p>"
          }
          if (status != 'available'){
            this.errors[fieldType] = true;

            login.errorsEl.empty();

            for (error in this.errors){
              login.errorsEl.append(messages[error]);
            }

            login.errorsEl.show();
            this.buttonEl.attr('disabled', true);
            this.buttonEl.addClass('disabled');
          } else {
            delete(this.errors[fieldType]);

            if (Object.keys(this.errors).length == 0){
              login.errorsEl.empty();
              login.errorsEl.hide();
              this.buttonEl.attr('disabled', false);
              this.buttonEl.removeClass('disabled');
            } else {
              login.errorsEl.empty();
              for (error in this.errors){
                login.errorsEl.append(messages[error]);
              }
              login.errorsEl.show();
            }
          }
        },

        checked : function(check) {
            if (check[0].checked)
            {
                check.attr('value', 'true');
            }else{
                check.attr('value', 'false');
            }
        },

        validate: function(){
          this.formValidated =  true;
          var checkit, body;

          switch(this.formType) {
              case 'signup':
                checkit = new Checkit({
                  'ProfileName'   : 'required',
                  'Email'         : ['required','email'],
                  'Password'      : ['required', 'minLength:8']
                });

                body = {
                  'ProfileName'   : this.formEl.find('.profileName').val(),
                  'Email'         : this.formEl.find('.email').val(),
                  'Password'      : this.formEl.find('.password').val(),
                };
                break;

              case 'login':
                checkit = new Checkit({
                    'Username'      : 'required',
                    'Password'      : ['required', 'minLength:8']
                  });

                  body = {
                    'Username'      : this.formEl.find('.username').val(),
                    'Password'      : this.formEl.find('.password').val(),
                  };
                  break;

              case 'forgot-password':
                checkit = new Checkit({
                    'Email'      : ['required', 'email'],
                  });

                  body = {
                    'Email'      : this.formEl.find('.email').val(),
                  };
                  break;

              case 'reset-password':
                checkit = new Checkit({
                    'Password'      : ['required', 'minLength:8'],
                  });

                  body = {
                    'Password'      : this.formEl.find('.password').val(),
                  };
                  break;

              default:
                  //¯\_(ツ)_/¯
          }

          return checkit.validateSync(body);

        },

        show : function(){
            this.element.addClass('active');
        },
        hide : function(){
            this.element.removeClass('active');
        }
    }
});
