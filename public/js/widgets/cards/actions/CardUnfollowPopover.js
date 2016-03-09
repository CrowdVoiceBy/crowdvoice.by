Class(CV, 'CardUnfollowPopover').inherits(Widget)({
    HTML : '\
        <ul class="ui-vertical-list hoverable -list-clean">\
            <li class="ui-vertical-list-item -color-negative" data-action="unfollow">Unfollow</li>\
            <li class="ui-vertical-list-item" data-action="cancel">Cancel</li>\
        </ul>',

    prototype : {
        el : null,
        unfollowButton : null,
        cancelButton : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.unfollowButton = this.el.querySelector('[data-action="unfollow"]');
            this.cancelButton = this.el.querySelector('[data-action="cancel"]');

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._unfollowClickHandlerRef = this._unfollowClickHandler.bind(this);
            this.unfollowButton.addEventListener('click', this._unfollowClickHandlerRef);

            this._cancelClickHanlderRef = this._cancelClickHanlder.bind(this);
            this.cancelButton.addEventListener('click', this._cancelClickHanlderRef);

            return this;
        },

        /* Unfollow Option Click Handler
         * @method _unfollowClickHandler <private> [Function]
         */
        _unfollowClickHandler : function _unfollowClickHandler() {
            this.dispatch('unfollow');
        },

        /* Cancel Option Click Handler
         * @method _cancelClickHanlder <private> [Function]
         */
        _cancelClickHanlder : function _cancelClickHanlder() {
            this.dispatch('cancel');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.unfollowButton.removeEventListener('click', this._unfollowClickHandlerRef);
            this._unfollowClickHandlerRef = null;

            this.cancelButton.removeEventListener('click', this._cancelClickHanlderRef);
            this._cancelClickHanlderRef = null;

            this.el = null;
            this.unfollowButton = null;
            this.cancelButton = null;

            return null;
        }
    }
});
