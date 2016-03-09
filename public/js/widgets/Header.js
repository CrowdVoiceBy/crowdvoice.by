/* globals App, NotificationBell */
var Person = require('./../lib/currentPerson');

Class(CV, 'Header').inherits(Widget).includes(CV.WidgetUtils)({
    // template replication of the original header element for quick visual reference of its main elements,
    // we do not use this, instead we use an already rendered version of it.
    HTML : '\
        <header class="cv-main-header">\
            <div class="-float-left">\
                <a class="cv-main-logo -inline-block"></a>\
                <div class="header-login-actions"></div>\
            </div>\
            <div class="-float-right -text-right">\
                <div class="header-actions"></div>\
            </div>\
        </header>',

    LOGIN_ACTIONS_HTML : '\
        <div class="login-action">\
            <div class="login-actions__list">\
                <a href="/signup" class="action-signup -ctu -ctu-primary">Signup</a> or <a href="/login" class="-ctu -ctu-primary">Login</a>\
            </div>\
        </div>',

    prototype : {
        /* private */
        el : null,
        loginActionsWrapper : null,
        buttonActionsWrapper : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            if (!this.el) { return; }

            this.loginActionsWrapper = this.el.querySelector('.header-login-actions');
            this.buttonActionsWrapper = this.el.querySelector('.header-actions');
        },

        /* Defines which buttons should be displayed based on currentPerson.
         * @method setup <public>
         * @return undefined
         */
        setup : function setup() {
            if (!this.el) { return; }

            if (!Person.get()) {
                this._setupVisitor();
            } else {
                if (Person.anon()) {
                    this._setupAnonymous();
                } else {
                    this._setupForCurrentPerson();
                }
            }

            this.appendChild(new CV.SearchButton({
                name : 'searchButton',
                className : 'header-actions-button'
            })).render(this.buttonActionsWrapper);
        },

        /* Destroy the createDropdown {voice, organization}
         * @method removeCreateDropdown <public> [Function]
         * @return Header
         */
        removeCreateDropdown : function removeCreateDropdown() {
            if (this.createDropdown) {
                this.createDropdown = this.createDropdown.destroy();
            }
            return this;
        },

        /* Append the ui for not logged in users
         * @method _setupVisitor <private> [Function]
         */
        _setupVisitor : function _setupVisitor() {
            this.loginActionsWrapper.insertAdjacentHTML('afterbegin', this.constructor.LOGIN_ACTIONS_HTML);

            return this;
        },

        _setupAnonymous : function _setupAnonymous() {
            this.loginActionsWrapper.style.paddingTop = 0;

            this.appendChild(new CV.AccountDropdownMenu({
                name : 'accountMenu',
            })).render(this.loginActionsWrapper);

            this._displayCreateNewDropdown();

            this.appendChild(new CV.IncognitoButton({
                name : 'incognitoButton'
            })).render(this.buttonActionsWrapper);

            this.appendChild(new NotificationBell({
              name : 'bell'
            })).render(this.buttonActionsWrapper);

            return this;
        },

        /* Append the ui for logged in users.
         * @method _setupForCurrentPerson <private> [Function]
         */
        _setupForCurrentPerson : function _setupForCurrentPerson() {
            this.loginActionsWrapper.style.paddingTop = 0;

            this.appendChild(new CV.AccountDropdownMenu({
                name : 'accountMenu',
            })).render(this.loginActionsWrapper);

            this._displayCreateNewDropdown();

            this.appendChild(new CV.IncognitoButton({
                name : 'incognitoButton',
            })).render(this.buttonActionsWrapper);

            this.appendChild(new NotificationBell({
              name : 'bell'
            })).render(this.buttonActionsWrapper);

            return this;
        },

        /* Displays the create new {voice,organization} dropdown
         * @method _displayCreateNewDropdown <private> [Function]
         */
        _displayCreateNewDropdown : function _displayCreateNewDropdown() {
            this.appendChild(new CV.Dropdown({
                name : 'createDropdown',
                label : 'Create New&nbsp;&nbsp;&nbsp;',
                showArrow : true,
                className : 'ui-dropdown-styled primary -md -inline-block -text-left -mr2',
                arrowClassName : '-s10 -color-white',
                bodyClassName : 'ui-vertical-list hoverable -full-width'
            })).render(this.buttonActionsWrapper);

            this.appendChild(new Widget({
                name : 'createDropdownVoice',
                className : 'ui-vertical-list-item -block'
            })).element.text('Voice');

            this.appendChild(new Widget({
                name : 'createDropdownOrganization',
                className : 'ui-vertical-list-item -block'
            })).element.text('Organization');

            this.createDropdown.addContent(this.createDropdownVoice.element[0]);
            this.createDropdown.addContent(this.createDropdownOrganization.element[0]);

            this.createDropdownVoice.element[0].addEventListener('click', function() {
                this.createDropdown.deactivate();
                App.showVoiceCreateModal({
                    ownerEntity : Person.get()
                });
            }.bind(this));

            this.createDropdownOrganization.element[0].addEventListener('click', function() {
                this.createDropdown.deactivate();
                App.showCreateOrganizationModal();
            }.bind(this));
        }
    }
});
