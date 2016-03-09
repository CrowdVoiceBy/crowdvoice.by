var Person = require('./../../../lib/currentPerson');
var Events = require('./../../../lib/events');

Class(CV, 'CardActionMessage').inherits(Widget).includes(BubblingSupport)({
    ELEMENT_CLASS : 'card-actions-item',
    HTML : '\
        <div>\
            <svg class="card-activity-svg -s16">\
                <use xlink:href="#svg-messages"></use>\
            </svg>\
            <p class="card-actions-label">Message</p>\
        </div>',

    prototype : {
        /* receiverEntityId */
        id : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            this.appendChild(new CV.SendMessage({
                name : 'sendMessageContent',
                data : {
                    profileName : Person.get().profileName,
                    senderEntityId : Person.get().id,
                    receiverEntityId : this.id
                }
            }));

            this.appendChild(new CV.PopoverBlocker({
                name : 'sendMessagePopover',
                title : 'Send Message',
                showCloseButton : true,
                className : 'card-send-message -text-left',
                content : this.sendMessageContent.el
            })).render(this.el);

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._closeRef = this._close.bind(this);
            this.sendMessageContent.bind('close', this._closeRef);
            this.sendMessagePopover.bind('activate', this.activate.bind(this));
            this.sendMessagePopover.bind('deactivate', this.deactivate.bind(this));

            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.el, 'click', this._clickHandlerRef);

            return this;
        },

        /* Click Button Handler.
         * @method _clickHandler <private> [Function]
         */
        _clickHandler : function _clickHandler() {
            this.sendMessageContent.setInitState();
            this.sendMessagePopover.activate();
        },

        _close : function _close() {
            this.sendMessagePopover.deactivate();
            this.deactivate();
        },

        _activate : function _activate() {
            Widget.prototype._activate.call(this);
            this.dispatch('card:action:popover:active');
        },

        _deactivate : function _deactivate() {
            Widget.prototype._deactivate.call(this);
            this.dispatch('card:action:popover:deactive');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.off(this.el, 'click', this._clickHandlerRef);
            this._clickHandlerRef = null;
            return null;
        }
    }
});
