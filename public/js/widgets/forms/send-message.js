var API = require('./../../lib/api');
var Events = require('./../../lib/events');

Class(CV, 'SendMessage').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'cv-form-send-messages -clearfix',
    HTML : '\
        <div>\
            <div class="form">\
                <div class="-col-12 placeholder-main">\
                </div>\
                <div class="-col-12 placeholder-send"></div>\
            </div>\
            <div class="sent-form -text-center -hide">\
                <h2 class="-mt0">Message Sent!</h2>\
                <p><span data-receiver-name></span> will recieve this message in his/her inbox.</p>\
                <br/>\
                <button class="success-message-button cv-button small">Close</button>\
            </div>\
        </div>\
    ',

    prototype : {
        type : null,
        data : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.formElement = this.el.querySelector('.form');
            this.sentMessageElement = this.el.querySelector('.sent-form');
            this.successMessageButton = this.sentMessageElement.querySelector('.success-message-button');
            this.receiverNameElement = this.sentMessageElement.querySelector('[data-receiver-name]');

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
                    label : 'Briefly write a message.',
                    attr : {rows : 2},
                    inputClassName : '-md -block',
                }
            })).render(this.el.querySelector('.placeholder-main'));

            this.appendChild(new CV.UI.Button({
                name : 'formButton',
                className : 'primary full',
                data : {value : 'Send Message'}
            })).render(this.el.querySelector('.placeholder-send'));

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
        _setSuccessState : function _setSuccessState(partnerName) {
            this.dom.updateText(this.receiverNameElement, partnerName.trim() || 'The partner');
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
                return void 0;
            }

            this.formButton.disable();

            API.sendMessage({
                profileName : this.data.profileName,
                data : {
                    type : 'message',
                    senderEntityId : this.data.senderEntityId,
                    receiverEntityId : this.data.receiverEntityId,
                    message : this.messageInput.getValue().trim()
                }
            }, this._sendMessageResponseHandler.bind(this));
        },

        /* Handles the API call response.
         * @messages _sendMessageResponseHandler <private>
         */
        _sendMessageResponseHandler : function _sendMessageResponseHandler(err, res) {
            this.formButton.enable();

            if (err) {
                console.log(err);
                return void 0;
            }

            this._setSuccessState(res.receiverEntity.name);
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
