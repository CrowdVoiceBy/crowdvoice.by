Class(CV, 'CardActionInvite').inherits(Widget).includes(BubblingSupport)({
    ELEMENT_CLASS : 'card-actions-item',
    HTML : '\
        <div>\
            <svg class="card-activity-svg -s16">\
                <use xlink:href="#svg-invite-to"></use>\
            </svg>\
            <p class="card-actions-label">Invite to&hellip;</p>\
        </div>',

    prototype : {
        entity: null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            this.appendChild(new CV.CardInviteToPopover({
                name : 'inviteToPopoverContent',
                entity : this.entity
            }));

            this.appendChild(new CV.PopoverBlocker({
                name : 'inviteToPopover',
                className : 'invite-to-popover',
                content : this.inviteToPopoverContent.el
            })).render(this.el);

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this.inviteToPopover.bind('activate', this.activate.bind(this));
            this.inviteToPopover.bind('deactivate', this.deactivate.bind(this));

            this._clickHandlerRef = this._clickHandler.bind(this);
            this.el.addEventListener('click', this._clickHandlerRef);

            return this;
        },

        /* Click Button Handler.
         * @method _clickHandler <private> [Function]
         */
        _clickHandler : function _clickHandler() {
            this.inviteToPopover.activate();
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

            this.el = null;

            return null;
        }
    }
});
