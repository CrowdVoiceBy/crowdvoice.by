var NotificationsStore = require('./../stores/NotificationsStore')
  , Events = require('./../lib/events');

Class('NotificationBell').inherits(Widget).includes(CV.WidgetUtils)({
  HTML: '\
    <button class="header-notification-button header-actions-button cv-button small rounded -p0 -rel ui-has-tooltip">\
      <svg class="header-actions-svg -s17">\
        <use xlink:href="#svg-notifications"></use>\
      </svg>\
      <span class="ui-badge -abs"></span>\
      <span class="ui-tooltip -bottom -nw">Notifications</span>\
    </button>',

  prototype: {
    init: function(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.badgeElement = this.el.querySelector('.ui-badge');
      this._bindEvents();
    },

    _bindEvents: function _bindEvents() {
      this._unseenNotificationsHandlerRef = this._unseenNotificationsHandler.bind(this);
      NotificationsStore.bind('unseenNotifications', this._unseenNotificationsHandlerRef);

      this._toggleNotificationsPopoverHandlerRef = this._toggleNotificationsPopoverHandler.bind(this);
      Events.on(this.el, 'click', this._toggleNotificationsPopoverHandlerRef);

      return this;
    },

    /* Button click event handler.
     * Toggle the NotificationsPopover widget.
     * @private
     */
    _toggleNotificationsPopoverHandler: function _toggleNotificationsPopoverHandler() {
      NotificationsStore.deleteAllNewNotifications();

      this.appendChild(new CV.PopoverBlocker({
        name: 'notificationsPopover',
        className: 'notifications-popover',
        placement: 'bottom-right'
      })).render(this.el);

      this.appendChild(new CV.NotificationsPopover({
        name: 'notificationsPopoverContent'
      })).render(this.notificationsPopover.element);

      this._destroyPopoverRef = this._destroyPopover.bind(this);
      this.notificationsPopover.bind('afterDeactivate', this._destroyPopoverRef);

      requestAnimationFrame(function () {
        this.notificationsPopover.activate();
        this.notificationsPopoverContent.setup();
      }.bind(this));
    },

    _destroyPopover: function _destroyPopover() {
      this.notificationsPopover.unbind('afterDeactivate', this._destroyPopoverRef);
      this._destroyPopoverRef = null;
      while (this.children.length > 0) {
        this.children[0].destroy();
      }
    },

    /* NotificationsStore 'unseenNotifications' event handler.
     * @private
     * @param {Object} res
     * @prototype {number} res.unseen
     */
    _unseenNotificationsHandler: function _unseenNotificationsHandler(res) {
      this._updateBubbleState(res.unseen);
    },

    /* Updates the bubble and button state.
     * @private
     */
    _updateBubbleState: function _updateBubbleState(notificationsLength) {
      this._notificationsLength = notificationsLength;

      if (this._notificationsLength) {
        this.dom.updateText(this.badgeElement, this._notificationsLength);
        this.dom.addClass(this.el, ['has-new-notifications']);
      } else {
        this.dom.removeClass(this.el, ['has-new-notifications']);
      }
    },

    destroy: function destroy() {
      NotificationsStore.unbind('unseenNotifications', this._unseenNotificationsHandlerRef);
      this._unseenNotificationsHandlerRef = null;

      Events.off(this.el, 'click', this._toggleNotificationsPopoverHandlerRef);
      this._toggleNotificationsPopoverHandlerRef = null;

      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
