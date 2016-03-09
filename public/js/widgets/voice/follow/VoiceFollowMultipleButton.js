/* This version of the button replaces the default one when the user is a also
 * an Organization Owner. The user then has to decide to follow a Voice, User
 * or Organization as him/herself or as the organization.
 * @inherits Widget
 */
var API = require('./../../../lib/api');

Class(CV, 'VoiceFollowMultipleButton').inherits(Widget).includes(CV.WidgetUtils)({
    FOLLOW_AS_TEXT : 'Follow Voice As..',
    FOLLOWING_AS_TEXT : '\
        <svg class="-s10 -vam">\
            <use xlink:href="#svg-checkmark"></use>\
        </svg>\
        <span style="padding-left:.4em;">Following Voice As...</span>',

    prototype : {
        /* Current Voice Model.
         * @property voice <required> [Object]
         */
        voice : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._setup()._bindEvents()._updateButtonState();
        },

        _setup : function _setup() {
            this.appendChild(new CV.UI.CurrentPersonEntitiesCheckboxes({
                name : 'dropdown',
                data : {
                    className : 'dropdown-entities-checkboxes ui-dropdown-styled -sm',
                    showArrow : true
                }
            })).render(this.el);

            this.dropdown.selectValues(this.voice.followersOwnedByCurrentPerson);

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
            API.followVoice({
                profileName : this.voice.owner.profileName,
                voiceSlug : this.voice.slug,
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
        _responseHandler : function _responseHandler(checkboxWidget, err, res) {
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
                this.dropdown.setLabel(this.constructor.FOLLOWING_AS_TEXT);
            } else {
                this.dropdown.setLabel(this.constructor.FOLLOW_AS_TEXT);
            }
            return this;
        }
    }
});
