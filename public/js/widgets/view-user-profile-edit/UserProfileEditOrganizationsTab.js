var API = require('./../../lib/api');
var Person = require('./../../lib/currentPerson');
var Velocity = require('velocity-animate');

Class(CV, 'UserProfileEditOrganizationsTab').inherits(Widget)({
    HTML : '\
        <div>\
            <div class="form-field">\
                <label data-label>You own and / or belong to 0 organizations</label>\
            </div>\
            <div data-list></div>\
        </div>',

    INFO_LABEL_TEMPLATE_STRING : 'You own and / or belong to {count} organizations',
    LEAVE_ORGANIZATION_EVENT_NAME : 'leave-organization-action-clicked',
    LEAVED_MESSAGE : 'You’ve being removed as a contributor from {organizationName}.',
    LEAVED_ERROR_MESSAGE : 'There was a problem while trying removing you from {organizationName}.',

    prototype : {
        /* Holds the instance of the organization the user is intended to leave.
         * @property _currentOrganizationToLeave <private> [Object]
         */
        _currentOrganizationToLeave : null,

        /* Holds the number of organization the user owns or belongs to.
         * This is used to update the counter live if s/he decides to leave
         * an organization. (since we do not update the page).
         */
        _totalOrganizationsCounter : 0,

        _errorAlert : null,
        _successAlert : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.labelElement = this.el.querySelector('[data-label]');
            this.listElement = this.el.querySelector('[data-list]');
            this._totalOrganizationsCounter = Person.get().organizations.length;

            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this._updateLabel();

            this.appendChild(new CV.PopoverConfirm({
                name : 'leavePopover',
                data : {
                    confirm : {
                        label : 'Leave',
                        className : '-color-negative'
                    }
                }
            }));

            this.appendChild(new CV.PopoverBlocker({
                name : 'popover',
                className : 'unfollow-popover',
                placement : 'top',
                content : this.leavePopover.el
            }));

            Person.get().organizations.forEach(function(organization, index) {
                this.appendChild(new CV.CardMini({
                    name : 'card_' + index,
                    className : 'cv-items-list',
                    data : organization
                })).render(this.listElement);

                if (Person.ownerOf('organization', organization.id) === false) {
                    this['card_' + index].addButtonAction({
                        name : 'leaveButton',
                        value : 'Leave',
                        className : 'micro',
                        eventName : this.constructor.LEAVE_ORGANIZATION_EVENT_NAME
                    });
                }
            }, this);

            return this;
        },

        /* Register the widget events.
         * @method _bindEvents <private> [Function]
         * @return UserProfileEditOrganizationsTab
         */
        _bindEvents : function _bindEvents() {
            this._leaveOrganizationIntentRef = this._leaveOrganizationIntent.bind(this);
            this.bind(this.constructor.LEAVE_ORGANIZATION_EVENT_NAME, this._leaveOrganizationIntentRef);

            this.leavePopover.bind('confirm', this._popOverLeaveClickHandler.bind(this));
            this.leavePopover.bind('cancel', this._popOverCancelClickHandler.bind(this));

            return this;
        },

        /* Updates the label of how many organizations you owns and belongs to,
         * it updates itself using the _totalOrganizationsCounter property.
         * @method _updateLabel <private> [Function]
         * @return undefined
         */
        _updateLabel : function _updateLabel() {
            this.labelElement.textContent = this.constructor.INFO_LABEL_TEMPLATE_STRING.replace(/{count}/, this._totalOrganizationsCounter);
        },

        /* User clicked the 'leave organization' button.
         * We will show a popover so it can confirm she really wants to leave.
         * @method _leaveOrganizationIntent <private> [Function]
         * @return undefined
         */
        _leaveOrganizationIntent : function _leaveOrganizationIntent(ev) {
            ev.stopPropagation();
            this._currentOrganizationToLeave = ev.target;
            this.popover.render(ev.target.actionsElement).activate();
        },

        /* Handles the popover 'cancel' custom event.
         * Just close the popover.
         * @method _popOverCancelClickHandler <private> [Function]
         * @return undefined
         */
        _popOverCancelClickHandler : function _popOverCancelClickHandler() {
            this.popover.deactivate();
        },

        /* Handles the popover 'leave' custom event.
         * Tells the server to remove entity from organization.
         * @method _popOverLeaveClickHandler <private> [Function]
         * @return undefined
         */
        _popOverLeaveClickHandler : function _popOverLeaveClickHandler() {
            this._currentOrganizationToLeave.leaveButton.disable();
            this.popover.deactivate();

            this._totalOrganizationsCounter--;
            this._updateLabel();
            Velocity(this._currentOrganizationToLeave.el, 'slideUp', {duration : 300});

            API.leaveOrganization({
                profileName : Person.get().profileName,
                data : {
                    entityId : Person.get().id,
                    orgId : this._currentOrganizationToLeave.data.id
                }
            }, function(org, err, res) {
                if (err) {
                    this._displayErrorAlert(this.constructor.LEAVED_ERROR_MESSAGE.replace(/{organizationName}/, org.data.name));
                    this._totalOrganizationsCounter++;
                    this._updateLabel();
                    org.leaveButton.enable();
                    Velocity(org.el, 'slideDown', {duration : 300});
                    return;
                }

                if (res.status === 'left') {
                    this._displaySuccessAlert(this.constructor.LEAVED_MESSAGE.replace(/{organizationName}/, org.data.name));
                }
            }.bind(this, this._currentOrganizationToLeave));
        },

        /* Displays a success alert, if already exists it will update the message.
         * @method _displaySuccessAlert <private> [Function]
         * @argument message <required> [String] the message to display.
         * @return undefined
         */
        _displaySuccessAlert : function _displaySuccessAlert(message) {
            if (this._successAlert) {
                return this._successAlert.update({
                    type : 'positive',
                    text: message
                }).shake();
            }

            this.appendChild(new CV.Alert({
                name : '_successAlert',
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
            if (this._errorAlert) {
                return this._errorAlert.update({
                    text: message,
                    type : 'negative'
                }).shake();
            }

            this.appendChild(new CV.Alert({
                name : '_errorAlert',
                type : 'negative',
                text : message,
                className : '-mb1'
            })).render(this.el, this.el.firstElementChild);
        }
    }
});
