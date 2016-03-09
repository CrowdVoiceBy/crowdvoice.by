var GeminiScrollbar = require('gemini-scrollbar')
  , Person = require('./../../lib/currentPerson')
  , API = require('./../../lib/api')
  , NotificationsStore = require('./../../stores/NotificationsStore')
  , Events = require('./../../lib/events');

Class(CV, 'NotificationsPopover').inherits(Widget).includes(BubblingSupport, CV.WidgetUtils)({
  ELEMENT_CLASS: 'notifications-popover-content',
  HTML: '\
    <div>\
      <header class="notifications-popover__header -clearfix">\
        <div class="-font-bold -upper -float-left">Notifications</div>\
        <div class="-float-right">\
          <a class="notifications-popover__header-settings" title="Manage notification settings">\
            <svg class="notifications-popover__header-settings-svg -s16">\
              <use xlink:href="#svg-settings"></use>\
            </svg>\
          </a>\
        </div>\
      </header>\
      <div class="notifications-popover__list -rel">\
        <div class="gm-scrollbar -vertical">\
          <div class="thumb"></div>\
        </div>\
        <div class="gm-scrollbar -horizontal">\
          <div class="thumb"></div>\
        </div>\
        <div class="notifications-popover__list-inner gm-scroll-view">\
        </div>\
      </div>\
      <div class="notifications-popover__footer">\
        <div data-footer-buttons-container class="cv-button-group multiple -row -full-width">\
      </div>\
      </div>\
    </div>',

  ONBOARDING_HTML: 'onboarding',

  prototype: {
    _fetched: false,
    _notificationWidgets: null,
    _latestScrollTop: 0,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this._notificationWidgets = [];
      this.listElement = this.element[0].querySelector('.notifications-popover__list');
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      var buttonsWrapper = this.element[0].querySelector('[data-footer-buttons-container]');

      this.scrollbar = new GeminiScrollbar({
        element: this.listElement,
        createElements: false,
        autoshow: true
      }).create();

      this.appendChild(new CV.Loading({
        name: 'loader'
      })).render(this.scrollbar.getViewElement()).center();

      this.dom.updateAttr('href', this.element[0].querySelector('.notifications-popover__header-settings'), '/' + Person.get('profileName') + '/edit/#notifications');

      this.appendChild(new CV.UI.Button({
        name: 'buttonMarkAllAsRead',
        className: 'cv-button tiny -col-6 -font-semi-bold -btlr0',
        data: {
          value: 'Mark All As Read'
        }
      })).render(buttonsWrapper);

      this.appendChild(new CV.UI.Button({
        name: 'buttonViewAll',
        className: 'cv-button tiny -col-6 -font-semi-bold -btrr0 -text-center',
        data: {
          value: 'View All',
          href: '/' + Person.get('profileName') + '/notifications'
        }
      })).render(buttonsWrapper);

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._notificationsHandlerRef = this._notificationsHandler.bind(this);
      NotificationsStore.bind('notifications', this._notificationsHandlerRef);

      this._notificationMarkAsReadHandlerRef = this._notificationMarkAsReadHandler.bind(this);
      this.bind('notification:markAsReadAndRedirect', this._notificationMarkAsReadHandlerRef);

      this._scrollHandlerRef = this._scrollHandler.bind(this);
      Events.on(this.scrollbar.getViewElement(), 'scroll', this._scrollHandlerRef);

      this._markAllAsReadHandlerRef = this._markAllAsReadHandler.bind(this);
      Events.on(this.buttonMarkAllAsRead.el, 'click', this._markAllAsReadHandlerRef);
    },

    setup: function setup() {
      if (NotificationsStore._notifications) {
        NotificationsStore.getNotifications();
      } else {
        NotificationsStore.fetchNotifications();
      }
      return this;
    },

    /* NotificationsStore 'notifications' event handler.
     * @private
     * @param {Object} res
     * @property {Array} res.notifications
     */
    _notificationsHandler: function _notificationsHandler(res) {
      var fragment = document.createDocumentFragment();

      if (this.loader) {
        this.loader = this.loader.disable().remove();
      }

      if (res.notifications.length === 0) {
        if (this._fetched === false) {
          this.appendChild(new CV.EmptyState({
            name: 'empty',
            className: '-pt4 -pb4',
            message: 'no notifications to show yet.'
          })).render(this.scrollbar.getViewElement());
        }
      } else if (this.empty) {
        this.empty = this.empty.destroy();
      }

      this._fetched = true;

      this._latestScrollTop = this.scrollbar.getViewElement().scrollTop;

      this._notificationWidgets.forEach(function (widget) {
        widget.destroy();
      });
      this._notificationWidgets = [];

      res.notifications.forEach(function (n) {
        var item = new CV.NotificationsPopoverItem({
          name: n.notificationId,
          data: n.action,
          notificationId: n.notificationId,
          read: n.read
        }).render(fragment);
        this._notificationWidgets.push(item);
        this.appendChild(item);
      }, this);

      this.scrollbar.getViewElement().appendChild(fragment);
      this.scrollbar.update().getViewElement().scrollTop = this._latestScrollTop;
    },

    /* NotificationItem 'notification:markAsRead' event handler.
     * @private
     */
    _notificationMarkAsReadHandler: function _notificationMarkAsReadHandler(ev) {
      ev.stopPropagation();
      NotificationsStore.decreaseUnseen();

      API.markNotificationAsRead({
        profileName: Person.get('profileName'),
        data: {notificationId: ev.target.notificationId}
      }, function(err, res) {
        if (err) return console.log(res);
        if (ev.redirectUrl) {
          window.location = ev.redirectUrl;
        }
      });
    },

    /* List scrollbar event handler.
     * @private
     */
    _scrollHandler: function _scrollHandler(ev) {
      var el = ev.currentTarget;
      if ((el.scrollTop + el.clientHeight) >= el.scrollHeight) {
        NotificationsStore.fetchNotifications();
      }
    },

    /* @private
     */
    _markAllAsReadHandler: function _markAllAsReadHandler() {
      API.markAllNotificationsAsRead({
        profileName: Person.get('profileName')
      }, function () {
        NotificationsStore.reFetchNotifications();
      });
    },

    destroy: function destroy() {
      NotificationsStore.unbind('notifications', this._notificationsHandlerRef);
      this._notificationsHandlerRef = null;

      Events.off(this.scrollbar.getViewElement(), 'scroll', this._scrollHandlerRef);
      this._scrollHandlerRef = null;

      Events.off(this.buttonMarkAllAsRead.el, 'click', this._markAllAsReadHandlerRef);
      this._markAllAsReadHandlerRef = null;

      this.scrollbar = this.scrollbar.destroy();

      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
