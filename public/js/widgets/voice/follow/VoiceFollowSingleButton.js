/* This widget is in fact a simple button. It is meant to be shown on the voice
 * view when currentPerson has no organizations owned, so it cannot choose with
 * which entity to follow the voice but as him/herself.
 * @inherits CV.UI.Button
 */
var Person = require('./../../../lib/currentPerson');
var API = require('./../../../lib/api');
var Events = require('./../../../lib/events');

Class(CV, 'VoiceFollowSingleButton').inherits(CV.UI.Button).includes(CV.WidgetUtils)({
    FOLLOW_TEXT : 'Follow Voice',
    FOLLOWING_TEXT : '\
        <svg class="-s10 -vam">\
            <use xlink:href="#svg-checkmark"></use>\
        </svg>\
        <span style="padding-left:.4em;">Following Voice</span>',

    prototype : {
        /* Current Voice Model.
         * @property voice <required> [Object]
         */
        voice : null,

        init : function init(config) {
            CV.UI.Button.prototype.init.call(this, config);
            this._bindEvents()._updateButtonState();
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.el, 'click', this._clickHandlerRef);
            return this;
        },

        /* Updates the button's text based on if currentPerson is following the
         * current voice.
         * @method _updateButtonState <private> [Function]
         * @return VoiceFollowButton
         */
        _updateButtonState : function _updateButtonState() {
            if (this.voice.followed) {
                this.dom.updateHTML(this.el, this.constructor.FOLLOWING_TEXT);
            } else {
                this.dom.updateHTML(this.el, this.constructor.FOLLOW_TEXT);
            }
            return this;
        },

        /* Handles the button click event.
         * Calls the API followVoice endpoint and handles its response.
         * @method _clickHandler <private> [Function]
         * @return undefined
         */
        _clickHandler : function _clickHandler() {
            this.disable();

            API.followVoice({
                profileName : this.voice.owner.profileName,
                voiceSlug : this.voice.slug,
                data : {followerId : Person.get().id}
            }, this._responseHandler.bind(this));
        },

        /* API response handler.
         * @method _responseHandler <private> [Function]
         * @return undefined
         */
        _responseHandler : function _responseHandler(err, res) {
            this.enable();

            if (err) {
                return;
            }

            if (res.status === "followed") {
                this.voice.followed = true;
            } else if (res.status === "unfollowed") {
                this.voice.followed = false;
            }

            this._updateButtonState();
        },

        destroy : function destroy() {
            Events.off(this.el, 'click', this._clickHandlerRef);
            this._clickHandlerRef = null;

            CV.UI.Button.prototype.destroy.call(this);
            return null;
        }
    }
});
