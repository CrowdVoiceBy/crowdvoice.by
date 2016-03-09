var Person = require('./../../../lib/currentPerson');
var Events = require('./../../../lib/events');

Class(CV, 'UserProfileMoreActions').inherits(Widget)({
    prototype : {
        /* Entity Model
         * @property entity <required> [EntityModel]
         */
        entity : null,

        _hasVoices : false,
        _hasOwnedOrganizations : false,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            this._hasVoices = Person.canInviteEntityToAVoice(this.entity);
            this._hasOwnedOrganizations = Person.canInviteEntityToAnOrg(this.entity);

            this._setup();
        },

        _setup : function _setup() {
            this.appendChild(new CV.Dropdown({
                name : 'settingsDropdown',
                showArrow : true,
                className : 'profile-actions-settings-dropdown ui-dropdown-styled -md',
                arrowClassName : '-s8 -color-grey',
                alignment : 'bottom-right',
                bodyClassName : 'ui-vertical-list hoverable -block'
            })).render(this.el);

            this.settingsDropdown.setLabel('\
                <svg class="-s16">\
                    <use xlink:href="#svg-settings"></use>\
                </svg>');

            if (this._hasOwnedOrganizations) {
                this.appendChild(new Widget({
                    name : 'dropdownInviteToOrganization',
                    className : 'ui-vertical-list-item -block'
                })).element.text('Invite to Organization');

                this.settingsDropdown.addContent(this.dropdownInviteToOrganization.element[0]);
                Events.on(this.dropdownInviteToOrganization.element[0], 'click', this._showInviteToOrganization.bind(this));
            }

            if (this._hasVoices) {
                this.appendChild(new Widget({
                    name : 'dropdownInviteToContribute',
                    className : 'ui-vertical-list-item -block'
                })).element.text('Invite to Contribute');

                this.settingsDropdown.addContent(this.dropdownInviteToContribute.element[0]);
                Events.on(this.dropdownInviteToContribute.element[0], 'click', this._showInviteToContribute.bind(this));
            }

            return this;
        },

        _showInviteToOrganization : function _showInviteToOrganization() {
            var inviteToOrganizationModal = new CV.UI.Modal({
                title : 'Invite to Organization',
                name : 'inviteToOrganizationModal',
                action : CV.InviteToOrganization,
                width : 650,
                data : this.entity
            }).render(document.body);

            requestAnimationFrame(function() {
                inviteToOrganizationModal.activate();
            });
        },

        _showInviteToContribute : function _showInviteToContribute() {
            var inviteToContributeModal = new CV.UI.Modal({
                title : 'Invite to Contribute',
                name : 'inviteToContributeModal',
                action : CV.InviteToContribute,
                width : 650,
                data : this.entity
            }).render(document.body);

            requestAnimationFrame(function() {
                inviteToContributeModal.activate();
            });
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            if (this._hasOwnedOrganizations) {
                Events.off(this.dropdownInviteToOrganization.element[0], 'click', this._showInviteToOrganization.bind(this));
            }

            if (this._hasVoices) {
                Events.off(this.dropdownInviteToContribute.element[0], 'click', this._showInviteToContribute.bind(this));
            }

            return null;
        }
    }
});

