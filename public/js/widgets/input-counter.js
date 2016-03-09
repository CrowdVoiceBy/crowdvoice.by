Class(CV, 'InputCounter').inherits(Widget).includes(CV.WidgetUtils)({

    HTML : '<span class="cv-input-counter"></span>',

    prototype : {
        /* options */
        inputReference : null,
        maxLength : 0,

        /* private */
        el : null,
        _inputHandlerRef : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            this._inputHandler();

            this._bindEvents();
        },

        /* Subscribe event listeners
         * @method _bindEvents <private> [Function]
         */
        _bindEvents : function _bindEvents() {
            this._inputHandlerRef = this._inputHandler.bind(this);
            this.inputReference.addEventListener('input', this._inputHandlerRef);

            return this;
        },

        /* Updates the counter.
         * @method _inputHandler <private> [Function]
         */
        _inputHandler : function _inputHandler() {
            var counter = this.maxLength - this.inputReference.value.length;

            this.dom.updateText(this.el, counter);

            if (counter < 1) this.el.classList.add('max-reached');
            else this.el.classList.remove('max-reached');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.inputReference.removeEventListener('input', this._inputHandlerRef);
            this._inputHandlerRef = null;

            return null;
        }
    }
});
