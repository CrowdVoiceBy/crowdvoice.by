Class(CV, 'PopoverUnsave').inherits(Widget)({
    HTML : '\
        <ul class="ui-vertical-list hoverable -list-clean">\
            <li class="ui-vertical-list-item -color-negative" data-action="unsave">Unsave</li>\
            <li class="ui-vertical-list-item" data-action="cancel">Cancel</li>\
        </ul>',

    prototype : {
        el : null,
        unsaveButton : null,
        cancelButton : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.unsaveButton = this.el.querySelector('[data-action="unsave"]');
            this.cancelButton = this.el.querySelector('[data-action="cancel"]');

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._unsaveClickHandlerRef = this._unsaveClickHandler.bind(this);
            this.unsaveButton.addEventListener('click', this._unsaveClickHandlerRef);

            this._cancelClickHanlderRef = this._cancelClickHanlder.bind(this);
            this.cancelButton.addEventListener('click', this._cancelClickHanlderRef);

            return this;
        },

        /* Unfollow Option Click Handler
         * @method _unsaveClickHandler <private> [Function]
         */
        _unsaveClickHandler : function _unsaveClickHandler() {
            this.dispatch('unsave');
        },

        /* Cancel Option Click Handler
         * @method _cancelClickHanlder <private> [Function]
         */
        _cancelClickHanlder : function _cancelClickHanlder() {
            this.dispatch('cancel');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.unsaveButton.removeEventListener('click', this._unsaveClickHandlerRef);
            this._unsaveClickHandlerRef = null;

            this.cancelButton.removeEventListener('click', this._cancelClickHanlderRef);
            this._cancelClickHanlderRef = null;

            this.el = null;
            this.unsaveButton = null;
            this.cancelButton = null;

            return null;
        }
    }
});

