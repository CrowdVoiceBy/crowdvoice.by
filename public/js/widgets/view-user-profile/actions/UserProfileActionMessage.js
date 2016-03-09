var Person = require('./../../../lib/currentPerson');
var Events = require('./../../../lib/events');

Class(CV, 'UserProfileActionMessage').inherits(CV.UI.Button)({
    prototype : {
        /* Entity Model
         * @property entity <required> [EntityModel]
         */
        entity : null,

        init : function init(config) {
            CV.UI.Button.prototype.init.call(this, config);

            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.el, 'click', this._clickHandlerRef);
        },

        _clickHandler : function _clickHandler() {
            this.appendChild(new CV.UI.Modal({
                title : 'Send Message',
                name : 'sendMessageModal',
                action : CV.SendMessage,
                data : {
                    profileName : Person.get().profileName,
                    senderEntityId : Person.get().id,
                    receiverEntityId : this.entity.id
                },
                width : 650
            })).render(document.body);

            requestAnimationFrame(function() {
                this.sendMessageModal.activate();
            }.bind(this));
        }
    }
});
