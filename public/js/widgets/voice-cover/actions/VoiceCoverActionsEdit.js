/* globals App */
var Events = require('./../../../lib/events');
var Person = require('./../../../lib/currentPerson');

Class(CV, 'VoiceCoverActionsEdit').inherits(CV.UI.Button)({
    ELEMENT_CLASS : 'cv-button tiny -mr1',
    prototype : {
        voiceEntity : null,

        init : function init(config) {
            CV.UI.Button.prototype.init.call(this, config);
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.el, 'click', this._clickHandlerRef);
        },

        _clickHandler : function _clickHandler() {
            App.showVoiceEditModal({
                voiceEntity : this.voiceEntity,
                ownerEntity : Person.get()
            });
        },

        destroy : function destroy() {
            Events.off(this.el, 'click', this._clickHandlerRef);
            this._clickHandlerRef = null;
            CV.UI.Button.prototype.destroy.call(this);
            return null;
        }
    }
});
