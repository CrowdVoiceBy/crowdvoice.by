var Events = require('./../../../lib/events');

Class(CV, 'PostModerateRemoveButton').inherits(Widget).includes(BubblingSupport)({
    HTML : '\
        <button class="post-moderate-remove-btn cv-button negative tiny -abs">\
            <svg class="-s16">\
                <use xlink:href="#svg-trash"></use>\
            </svg>\
        </button>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.appendChild(new CV.PopoverConfirm({
                name : 'confirmPopover',
                data : {
                    confirm : {
                        label : 'Delete Post',
                        className : '-color-negative'
                    }
                }
            }));

            this.appendChild(new CV.PopoverBlocker({
                name : 'popover',
                className : 'delete-post-popover  -text-left -nw',
                placement : 'left',
                content : this.confirmPopover.el
            }));

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.el, 'click', this._clickHandlerRef);

            this._popOverConfirmClickHandlerRef = this._popOverConfirmClickHandler.bind(this);
            this.confirmPopover.bind('confirm', this._popOverConfirmClickHandlerRef);

            this._popOverCancelClickHandlerRef = this._popOverCancelClickHandler.bind(this);
            this.confirmPopover.bind('cancel', this._popOverCancelClickHandlerRef);

            return this;
        },

        /* Handles the click event on the button.
         * @method _clickHandler <private> [Function]
         * @return undefined
         */
        _clickHandler : function _clickHandler(ev) {
            ev.stopPropagation();
            this.popover.render(ev.currentTarget).activate();
        },

        /* Handles the popover 'cancel' custom event.
         * Just close the popover.
         * @method _popOverCancelClickHandler <private> [Function]
         * @return undefined
         */
        _popOverCancelClickHandler : function _popOverCancelClickHandler(ev) {
            ev.stopPropagation();
            this.popover.deactivate();
        },

        /* Handles the popover 'confirm' custom event.
         * @method _popOverConfirmClickHandler <private> [Function]
         * @return undefined
         */
        _popOverConfirmClickHandler : function _popOverConfirmClickHandler(ev) {
            ev.stopPropagation();
            this.popover.deactivate();
            this.disable();
            this.dispatch('post:moderate:delete', {data: this});
        },

        _disable : function _disable() {
            Widget.prototype._disable.call(this);
            this.el.classList.add('-muted');
            this.el.setAttribute('disabled', true);
        },

        _enable : function _enable() {
            Widget.prototype._enable.call(this);
            this.el.classList.remove('-muted');
            this.el.removeAttribute('disabled');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            Events.off(this.el, 'click', this._clickHandlerRef);
            this._clickHandlerRef = null;

            return null;
        }
    }
});
