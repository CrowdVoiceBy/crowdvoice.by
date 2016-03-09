/* jshint multistr: true */
Class(CV, 'VoiceModerateDoneButton').inherits(Widget)({

    HTML : '<button class="request-to-contribute-button cv-button primary tiny">Done</button>',

    prototype : {

        el : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            this.el.addEventListener('click', this._clickHandlerRef);
            return this;
        },

        _clickHandler : function _clickHandler() {
            this.dispatch('click');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.el.removeEventListener('click', this._clickHandlerRef);
            this._clickHandlerRef = null;

            this.el = null;

            return null;
        }
    }
});

