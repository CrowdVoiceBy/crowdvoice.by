var Person = require('./../../lib/currentPerson');

Class(CV, 'AccountDropdownMenu').inherits(Widget)({
    ELEMENT_CLASS : '-inline-block -full-height',

    LABEL_TEMPLATE : '\
        <img src="{avatar_source}" class="-rounded -color-bg-neutral-x-light" width="28" height="28" alt="{alt}"/>\
        <span class="account-menu-label">{name}</span>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            this._setup();
        },

        _setup : function _setup() {
            this.appendChild(new CV.Dropdown({
                name : 'dropdown',
                label : Person.get('name'),
                showArrow : true,
                className : 'account-dropdown-menu -inline-block -full-height',
                arrowClassName : '-s10',
                bodyClassName : 'ui-vertical-list hoverable -full-width'
            })).render(this.el);

            var label = this.constructor.LABEL_TEMPLATE;
            label = label.replace(/{avatar_source}/, Person.getImage('notification'));
            label = label.replace(/{name}/, Person.get('name'));
            label = label.replace(/{alt}/, Person.get('name') + '’s avatar image');
            this.dropdown.setLabel(label);

            if (Person.anon() === true) {
                this._setupAnonymous();
            } else {
                this._setupForCurrentPerson();
            }

            this.dropdown.addContent(new CV.AccountDropdownMenuItem({
                name : 'logout',
                label : 'Logout',
                url : '/logout'
            }).el);
        },

        _setupForCurrentPerson : function _setupForCurrentPerson() {
            this.dropdown.addContent(new CV.AccountDropdownMenuItem({
                name : 'view_profile',
                label : 'Your Profile',
                url : '/' + Person.get('profileName') + '/'
            }).el);

            this.dropdown.addContent(new CV.AccountDropdownMenuItem({
                name : 'manage_account',
                label : 'Manage Account',
                url : '/' + Person.get('profileName') + '/edit/'
            }).el);

            Person.get().ownedOrganizations.forEach(function(organization, index) {
                this.dropdown.addContent(new CV.AccountDropdownMenuItem({
                    name : 'organization_' + index,
                    label : organization.name,
                    isOrganization : true,
                    organizationData : organization
                }).el);
            }, this);
        },

        _setupAnonymous : function _setupAnonymous() {
            console.log('setup for anon');
        }
    }
});
