var Events = require('./../../lib/events');

Class(CV, 'PopoverConfirm').inherits(Widget).includes(CV.WidgetUtils)({
    HTML : '\
        <ul class="ui-vertical-list hoverable -list-clean">\
            <li class="ui-vertical-list-item" data-action="confirm">Confirm</li>\
            <li class="ui-vertical-list-item" data-action="cancel">Cancel</li>\
        </ul>',

    prototype : {
        data : {
            confirm : {
                label : 'Confirm',
                className : ''
            }
        },

        el : null,
        confirmButton : null,
        cancelButton : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.confirmButton = this.el.querySelector('[data-action="confirm"]');
            this.cancelButton = this.el.querySelector('[data-action="cancel"]');

            if (this.data.confirm) {
                this.dom.updateText(this.confirmButton, this.data.confirm.label);
                this.dom.addClass(this.confirmButton, this.data.confirm.className.split(' '));
            }

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this.confirmClickHandlerRef = this._confirmClickHandler.bind(this);
            Events.on(this.confirmButton, 'click', this.confirmClickHandlerRef);

            this._cancelClickHanlderRef = this._cancelClickHanlder.bind(this);
            Events.on(this.cancelButton, 'click', this._cancelClickHanlderRef);

            return this;
        },

        /* Confirm Option Click Handler.
         * @method _confirmClickHandler <private> [Function]
         */
        _confirmClickHandler : function _confirmClickHandler() {
            this.dispatch('confirm');
        },

        /* Cancel Option Click Handler
         * @method _cancelClickHanlder <private> [Function]
         */
        _cancelClickHanlder : function _cancelClickHanlder() {
            this.dispatch('cancel');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            Events.off(this.confirmButton, 'click', this.confirmClickHandlerRef);
            this.confirmClickHandlerRef = null;

            Events.off(this.cancelButton, 'click', this._cancelClickHanlderRef);
            this._cancelClickHanlderRef = null;

            return null;
        }
    }
});
