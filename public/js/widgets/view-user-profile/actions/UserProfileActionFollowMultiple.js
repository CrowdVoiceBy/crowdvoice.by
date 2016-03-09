var API = require('./../../../lib/api');

Class(CV, 'UserProfileActionFollowMultiple').inherits(Widget)({
    prototype : {
        /* Entity Model
         * @property entity <required> [EntityModel]
         */
        entity : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._setup()._bindEvents()._updateButtonState();
        },

        _setup : function _setup() {
            this.appendChild(new CV.UI.CurrentPersonEntitiesCheckboxes({
                name : 'dropdown',
                data : {
                    className : 'dropdown-entities-checkboxes ui-dropdown-styled -md',
                    showArrow : false,
                    alignment : 'bottom-right',
                    bodyClassName : 'ui-vertical-list hoverable -block -text-left'
                }
            })).render(this.el);

            this.dropdown.selectValues(this.entity.followersOwnedByCurrentPerson);

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._doneButtonClickHandlerRef = this._doneButtonClickHandler.bind(this);
            this.dropdown.bind('doneButtonClicked', this._doneButtonClickHandlerRef);

            this._changeHandlerRef = this._changeHandler.bind(this);
            this.dropdown.bind('changed', this._changeHandlerRef);
            return this;
        },

        /* Listens and handle the checkbox change state.
         * Tells the server to stablish a new `follow` relationship.
         * @method _changeHandler <private> [Function]
         * @return undefined
         */
        _changeHandler : function _changeHandler(ev) {
            API.followEntity({
                profileName : this.entity.profileName,
                data : {followerId : ev.checkbox.id}
            }, this._responseHandler.bind(this, ev.checkbox));
        },

        /* API response handler.
         * @method _responseHandler <private> [Function]
         * @argument checkboxWidget <required> [Widget] the checkbox instance related with the request.
         * @argument err <required> [Boolean] tells if an error happened on the server request.
         * @argument res <required> [Object] the server response.
         * @return undefined
         */
        _responseHandler : function _responseHandler(checkboxWidget, err) {
            if (err) {
                /* revert silently without forcing it to dispatch the change event,
                 * since we are listening the change event to tell the server to
                 * update the follow state it may cause an infinite loop if the
                 * errors still firing without end
                 */
                if (checkboxWidget.isChecked()) {
                    checkboxWidget.checkbox.checked = false;
                } else {
                    checkboxWidget.checkbox.checked = true;
                }
            }

            this._updateButtonState();
        },

        /* Just close the dropdown.
         * @method _doneButtonClickHandler <private> [Function]
         * @return undefined
         */
        _doneButtonClickHandler : function _doneButtonClickHandler() {
            this.dropdown.deactivate();
        },

        /* Updates the button's text based on the dropdown selection state.
         * current voice.
         * @method _updateButtonState <private> [Function]
         * @return VoiceFollowButton
         */
        _updateButtonState : function _updateButtonState() {
            if (this.dropdown.getSelection().length) {
                this.dropdown.setLabel('\
                    <svg class="-s14 -vam">\
                        <use xlink:href="#svg-checkmark"></use>\
                    </svg> Following As...');
            } else {
                this.dropdown.setLabel('Follow As...');
            }
            return this;
        }
    }
});
