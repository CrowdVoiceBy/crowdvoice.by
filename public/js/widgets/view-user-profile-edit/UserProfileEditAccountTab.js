var Person = require('./../../lib/currentPerson');
var API = require('./../../lib/api');
var Events = require('./../../lib/events');
var Checkit = require('checkit');

Class(CV, 'UserProfileEditAccountTab').inherits(Widget)({
    HTML : '\
        <div>\
            <div class="-row">\
                <div class="-col-6">\
                    <div class="-row" class="edit-profile__email-container">\
                        <div class="-col-7 -pr1" data-email-container></div>\
                        <div class="edit-profile__account-actions -col-5" data-email-actions-container></div>\
                    </div>\
                </div>\
            </div>\
            <div class="-row">\
                <div class="-col-6">\
                    <div class="-row" class="edit-profile__password-container">\
                        <div class="-col-7 -pr1" data-password-container></div>\
                        <div class="edit-profile__account-actions -col-5" data-password-actions-container></div>\
                    </div>\
                </div>\
            </div>\
            <div data-show-password-wrapper>\
            </div>\
        </div>',

    CHANGE_HTML : '\
        <div class="cv-edit-icon-text -color-neutral-mid -inline-block -clickable">\
            <svg class="cv-edit-icon-text__svg -s14">\
                <use xlink:href="#svg-pencil"></use>\
            </svg>\
            <span class="cv-edit-icon-text__text">Change</span>\
        </div>',

    MIN_PASSWORD_LENGTH : 8,

    prototype : {
        data : {email : null},

        _alertSuccess : null,
        _alertError : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._emailActionsContainer = this.el.querySelector('[data-email-actions-container]');
            this._emailChange = null;
            this._emailActionButtonsGroup = null;
            this._passwordActionsContainer = this.el.querySelector('[data-password-actions-container]');
            this._passwordChange = null;
            this._passwordActionButtonsGroup = null;

            this.checkitEmail = new Checkit({
                email : ['required', 'email']
            });

            this.checkitPassword = new Checkit({
                password : ['required', 'minLength:' + this.constructor.MIN_PASSWORD_LENGTH]
            });

            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this._setupEmail()._setEmailNonEditableState();
            this._setupPassword()._setPasswordNonEditableState();

            this.appendChild(new CV.UI.Checkbox({
                name : 'showPasswordCheckbox',
                data : {label : 'Show Password' }
            })).render(this.el.querySelector('[data-show-password-wrapper]'));

            return this;
        },

        /* Setup the Email email along with its change, save and cancel action buttons.
         * @method _setupEmail <private> [Function]
         * @return UserProfileEditAccountTab
         */
        _setupEmail : function _setupEmail() {
            this.appendChild(new CV.UI.Input({
                name : 'emailInput',
                className : '-nw',
                data : {
                    label : 'Your Email',
                    hint : '',
                    attr : {
                        value : this.data.email,
                        type : 'text'
                    },
                    inputClassName : '-md -block'
                }
            })).render(this.el.querySelector('[data-email-container]'));

            this._emailActionsContainer.insertAdjacentHTML('beforeend', this.constructor.CHANGE_HTML);
            this._emailChange = this._emailActionsContainer.firstElementChild;

            this._emailActionButtonsGroup = document.createElement('div');
            this.appendChild(new CV.UI.Button({
                name : 'emailSaveButton',
                className : 'positive tiny',
                data : {value : 'Save'}
            })).render(this._emailActionButtonsGroup);

            this.appendChild(new CV.UI.Button({
                name : 'emailCancelButton',
                className : 'tiny',
                data : {value : 'Cancel'}
            })).render(this._emailActionButtonsGroup);
            this._emailActionsContainer.appendChild(this._emailActionButtonsGroup);

            return this;
        },

        /* Setup the Password email along with its change, save and cancel action buttons.
         * @method _setupEmail <private> [Function]
         * @return UserProfileEditAccountTab
         */
        _setupPassword : function _setupPassword() {
            this.appendChild(new CV.UI.Input({
                name : 'passwordInput',
                className : '-nw',
                data : {
                    label : 'Your Password',
                    hint : '',
                    attr : {
                        type : 'password',
                        minLength : 8
                    },
                    inputClassName : '-md -block'
                }
            })).render(this.el.querySelector('[data-password-container]'));

            this._passwordActionsContainer.insertAdjacentHTML('beforeend', this.constructor.CHANGE_HTML);
            this._passwordChange = this._passwordActionsContainer.firstElementChild;

            this._passwordActionButtonsGroup = document.createElement('div');
            this.appendChild(new CV.UI.Button({
                name : 'passwordSaveButton',
                className : 'positive tiny',
                data : {value : 'Save'}
            })).render(this._passwordActionButtonsGroup);

            this.appendChild(new CV.UI.Button({
                name : 'passwordCancelButton',
                className : 'tiny',
                data : {value : 'Cancel'}
            })).render(this._passwordActionButtonsGroup);
            this._passwordActionsContainer.appendChild(this._passwordActionButtonsGroup);

            return this;
        },

        /* Register the widget events.
         * @method _bindEvents <private> [Function]
         * @return UserProfileEditAccountTab
         */
        _bindEvents : function _bindEvents() {
            Events.on(this._emailChange, 'click', this._setEmailEditableState.bind(this));
            Events.on(this.emailSaveButton.el, 'click', this._emailSaveButtonClickHandler.bind(this));
            Events.on(this.emailCancelButton.el, 'click', this._setEmailNonEditableState.bind(this));

            Events.on(this._passwordChange, 'click', this._setPasswordEditableState.bind(this));
            Events.on(this.passwordSaveButton.el, 'click', this._passwordSaveButtonClickHandler.bind(this));
            Events.on(this.passwordCancelButton.el, 'click', this._setPasswordNonEditableState.bind(this));

            this.showPasswordCheckbox.bind('changed', this._togglePasswordInputType.bind(this));

            return this;
        },

        /* Sets the Email row as editable; hides the change button, shows the
         * save/cancel actions and focus the input.
         * @method _setEmailEditableState <private> [Function]
         */
        _setEmailEditableState : function _setEmailEditableState() {
            this.emailInput.enable();
            this.emailInput.getInput().focus();
            this._emailChange.style.display = 'none';
            this._emailActionButtonsGroup.style.display = '';
        },

        /* Sets the Email row as non-editable; shows the change button and hides
         * the save/cancel actions.
         * @method _setEmailNonEditableState <private> [Function]
         */
        _setEmailNonEditableState : function _setEmailNonEditableState() {
            this.emailInput.clearState().updateHint().disable();
            this._emailActionButtonsGroup.style.display = 'none';
            this._emailChange.style.display = '';
        },

        /* Sets the Password row as editable; hides the change button, shows the
         * save/cancel actions and focus the input.
         * @method _setEmailEditableState <private> [Function]
         */
        _setPasswordEditableState : function _setPasswordEditableState() {
            this.passwordInput.enable();
            this.passwordInput.getInput().focus();
            this._passwordChange.style.display = 'none';
            this._passwordActionButtonsGroup.style.display = '';
        },

        /* Sets the Password row as non-editable; shows the change button, hides
         * the save/cancel actions and clears the password input value.
         * @method _setEmailNonEditableState <private> [Function]
         */
        _setPasswordNonEditableState : function _setPasswordNonEditableState() {
            this.passwordInput.clearState().updateHint().disable();
            this.passwordInput.setValue('');
            this._passwordActionButtonsGroup.style.display = 'none';
            this._passwordChange.style.display = '';
        },

        /* Handles the 'Save Email' button click event.
         * Checks if the emailInput value is well formated, if so it will send
         * the updateUser request to the server, otherwise it will display the
         * any kind of error.
         * @method _emailSaveButtonClickHandler <private> [Function]
         * @return undefined
         */
        _emailSaveButtonClickHandler : function _emailSaveButtonClickHandler() {
            var valid = this.checkitEmail.validateSync({
                'email': this.emailInput.getValue()
            });

            this.emailInput.disable();
            this.emailSaveButton.disable();

            if (valid[0]) {
                this.emailInput.clearState().error().enable();
                this.emailSaveButton.enable();

                return this.emailInput.updateHint({
                    hint : '(must be a valid email address)',
                    className : '-color-negative'
                });
            }

            API.updateUser({
                profileName : Person.get().profileName,
                data : {email : this.emailInput.getValue()}
            }, function (err, res) {
                if (err) {
                    return this._displayErrorAlert('Error while updating your email - (' + res.status + ')');
                }

                this.emailInput.enable();
                this.emailSaveButton.enable();
                this._setEmailNonEditableState();
                this._displaySuccessAlert('Your email has been updated.');
            }.bind(this));
        },

        /* Handles the 'Save Password' button click event.
         * Checks if the passwordInput value is well formated, if so it will send
         * the updateUser request to the server, otherwise it will display the
         * any kind of error.
         * @method _passwordSaveButtonClickHandler <private> [Function]
         * @return undefined
         */
        _passwordSaveButtonClickHandler : function _passwordSaveButtonClickHandler() {
            var valid = this.checkitPassword.validateSync({
                'password': this.passwordInput.getValue()
            });

            this.passwordInput.disable();
            this.passwordSaveButton.disable();

            if (valid[0]) {
                this.passwordInput.clearState().error().enable();
                this.passwordSaveButton.enable();

                return this.passwordInput.updateHint({
                    hint : '(must be at least 8 characters long)',
                    className : '-color-negative'
                });
            }

            API.updateUser({
                profileName : Person.get().profileName,
                data : {password : this.passwordInput.getValue()}
            }, function (err, res) {
                if (err) {
                    return this._displayErrorAlert('Error while updating your password - (' + res.status + ')');
                }

                this.passwordInput.enable();
                this.passwordSaveButton.enable();
                this._setPasswordNonEditableState();
                this._displaySuccessAlert('Your password has been updated.');
            }.bind(this));
        },

        /* Toggle the passwordInput type (text/password) based on the showPasswordCheckbox value.
         * @method _togglePasswordInputType <private> [Function]
         * @return undefined
         */
        _togglePasswordInputType : function _togglePasswordInputType(ev) {
            if (ev.target.isChecked()) {
                return this.passwordInput.getInput().setAttribute('type', 'text');
            }

            this.passwordInput.getInput().setAttribute('type', 'password');
        },

        /* Displays a success alert, if already exists it will update the message.
         * @method _displaySuccessAlert <private> [Function]
         * @argument message <required> [String] the message to display.
         * @return undefined
         */
        _displaySuccessAlert : function _displaySuccessAlert(message) {
            if (this._alertSuccess) {
                return this._alertSuccess.update({
                    type : 'positive',
                    text: message
                }).shake();
            }

            this.appendChild(new CV.Alert({
                name : '_alertSuccess',
                type : 'positive',
                text : message,
                className : '-mb1'
            })).render(this.el, this.el.firstElementChild);
        },

        /* Displays an error alert, if already exists it will update the message.
         * @method _displayErrorAlert <private> [Function]
         * @argument message <required> [String] the message to display.
         * @return undefined
         */
        _displayErrorAlert : function _displayErrorAlert(message) {
            if (this._alertError) {
                return this._alertError.update({
                    type : 'negative',
                    text: message
                }).shake();
            }

            this.appendChild(new CV.Alert({
                name : '_alertError',
                type : 'negative',
                text : message,
                className : '-mb1'
            })).render(this.el, this.el.firstElementChild);
        }
    }
});
