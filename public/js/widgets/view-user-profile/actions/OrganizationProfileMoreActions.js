var Events = require('./../../../lib/events');

Class(CV, 'OrganizationProfileMoreActions').inherits(Widget)({
    prototype : {
        /* Entity Model
         * @property entity <required> [EntityModel]
         */
        entity : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._setup()._bindEvents();
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

            this.appendChild(new Widget({
                name : 'dropdownRequestMembership',
                className : 'ui-vertical-list-item -block'
            })).element.text('Request Membership');

            this.settingsDropdown.addContent(this.dropdownRequestMembership.element[0]);

            return this;
        },

        _bindEvents : function _bindEvents() {
            Events.on(this.dropdownRequestMembership.element[0], 'click', this._showRequestMembership.bind(this));
        },

        _showRequestMembership : function _showRequestMembership() {
            var requestMembershipModal = new CV.UI.Modal({
                title : 'Request Membership',
                name : 'requestMembershipModal',
                action : CV.RequestMembership,
                width : 650,
                data : {
                    orgId : this.entity.id,
                    profileName : this.entity.profileName
                }
            }).render(document.body);

            requestAnimationFrame(function() {
                requestMembershipModal.activate();
            });
        }
    }
});

