var API = require('./../../lib/api');
var Events = require('./../../lib/events');

Class(CV, 'RequestMembership').inherits(Widget)({
    ELEMENT_CLASS : 'cv-form-request-membership',
    HTML : '\
        <div>\
            <div class="form">\
                <div data-placeholder-main></div>\
                <div data-placeholder-send></div>\
            </div>\
            <div class="sent-form -hide">\
                <h2>Thanks for the interest to be a member!</h2>\
                <p>We will review your request as soon as possible and may contact with a response.</p>\
                <br>\
                <button class="success-message-button cv-button ok small">Ok</button>\
            </div>\
        </div>\
    ',

    prototype : {
        data : {
            profileName : null,
            orgId : null
        },

        init : function(config){
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.formElement = this.el.querySelector('.form');
            this.sentMessageElement = this.el.querySelector('.sent-form');
            this.successMessageButton = this.sentMessageElement.querySelector('.success-message-button');

            this._setup()._bindEvents();
        },

        /* Append the children. Called by init.
         * @method _setup <private>
         */
        _setup : function _setup() {
            this.appendChild(new CV.UI.Input({
                name : 'messageInput',
                data : {
                    isTextArea : true,
                    label : 'Briefly state why would you be a valuable member for this Organization.',
                    attr : {rows : 2},
                    inputClassName : '-md -block',
                }
            })).render(this.el.querySelector('[data-placeholder-main]'));

            this.appendChild(new CV.UI.Button({
                name : 'formButton',
                className : 'primary full',
                data : {value : 'Submit Request'}
            })).render(this.el.querySelector('[data-placeholder-send]'));

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._sendMessageRef = this._sendMessageHandler.bind(this);
            Events.on(this.formButton.el, 'click', this._sendMessageRef);

            this._closeRef = this._close.bind(this);
            Events.on(this.successMessageButton, 'click', this._closeRef);
            return this;
        },

        /* Clears the form input state and displays the form.
         * @method setInitState <public>
         */
        setInitState : function setInitState() {
            this.formElement.classList.remove('-hide');
            this.sentMessageElement.classList.add('-hide');
            this.messageInput.clearState().setValue('');
            return this;
        },

        /* Displays the 'Message Sent' state after a successful response.
         * @method _setSuccessState <private>
         */
        _setSuccessState : function _setSuccessState() {
            this.sentMessageElement.classList.remove('-hide');
            this.formElement.classList.add('-hide');
            this.messageInput.clearState();
            return this;
        },

        /* SendButton click handler.
         * Checks if the message can be send, if so it will call our API,
         * otherwise it will show an error as feedback.
         * @method _sendMessageHandler <private>
         */
        _sendMessageHandler : function _sendMessageHandler() {
            if (this.messageInput.getValue().trim().length === 0) {
                this.messageInput.error();
                return;
            }

            API.requestMembership({
                profileName : this.data.profileName,
                data : {
                    orgId : this.data.orgId,
                    message : this.messageInput.getValue().trim()
                }
            }, this._sendMessageResponseHandler.bind(this));
        },

        /* Handles the API call response.
         * @messages _sendMessageResponseHandler <private>
         */
        _sendMessageResponseHandler : function _sendMessageResponseHandler(err, res) {
            console.log(err);
            console.log(res);

            if (err) {
                console.log(err);
                return;
            }

            this._setSuccessState();
        },

        _close : function _close() {
            this.dispatch('close');
            this.setInitState();
        },

        destroy : function destroy() {
            Events.off(this.formButton.el, 'click', this._sendMessageRef);
            this._sendMessageRef = null;
            Events.off(this.successMessageButton, 'click', this._closeRef);
            this._closeRef = null;
            Widget.prototype.destroy.call(this);
            return null;
        }
    }
});
