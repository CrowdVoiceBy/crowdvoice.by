var NotificationsStore = require('./../stores/NotificationsStore')
  , Person = require('./../lib/currentPerson')
  , API = require('./../lib/api')
  , Events = require('./../lib/events');

Class(CV.Views, 'Notifications').includes(NodeSupport, CustomEventSupport)({
  prototype: {
    _fetched: false,
    _notificationWidgets: null,
    init: function init(config) {
      Object.keys(config || {}).forEach(function (key) {
        this[key] = config[key];
      }, this);
      this._notificationWidgets = [];
      this.profileBody = this.el.querySelector('.profile-body');
      this._window = window;
      this._body = document.body;
      this._bindEvents();
    },

    setup: function setup() {
      if (NotificationsStore._notifications) {
        NotificationsStore.getNotifications();
      } else {
        NotificationsStore.fetchNotifications();
      }
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._notificationsHandlerRef = this._notificationsHandler.bind(this);
      NotificationsStore.bind('notifications', this._notificationsHandlerRef);

      this._notificationMarkAsReadAndRedirectHandlerRef = this._notificationMarkAsReadAndRedirectHandler.bind(this);
      this.bind('notification:markAsReadAndRedirect', this._notificationMarkAsReadAndRedirectHandlerRef);

      this._notificationMarkAsReadHandlerRef = this._notificationMarkAsReadHandler.bind(this);
      this.bind('notification:markAsRead', this._notificationMarkAsReadHandlerRef);

      this._scrollHandlerRef = this._scrollHandler.bind(this);
      Events.on(this._window, 'scroll', this._scrollHandlerRef);
    },

    /* NotificationsStore 'notifications' event handler.
     * @private
     * @param {Object} res
     * @property {Array} res.notifications
     */
    _notificationsHandler: function _notificationsHandler(res) {
      var fragment = document.createDocumentFragment();

      if (res.notifications.length === 0) {
        if (this._fetched === false) {
          this.appendChild(new CV.EmptyState({
            name: 'empty',
            className: '-pt4 -pb4',
            message: 'no notifications to show yet.'
          })).render(this.profileBody);
        }
      } else if (this.empty) {
        this.empty = this.empty.destroy();
      }

      this._fetched = true;

      this._notificationWidgets.forEach(function (widget) {
        widget.destroy();
      });
      this._notificationWidgets = [];

      res.notifications.forEach(function (n) {
        var item = new CV.NotificationsPageItem({
          name: n.notificationId,
          data: n.action,
          notificationId: n.notificationId,
          read: n.read
        }).render(fragment);
        this._notificationWidgets.push(item);
        this.appendChild(item);
      }, this);

      this.profileBody.appendChild(fragment);
    },

    /* NotificationItem 'notification:markAsReadAndRedirect' event handler.
     * @private
     */
    _notificationMarkAsReadAndRedirectHandler: function _notificationMarkAsReadAndRedirectHandler(ev) {
      ev.stopPropagation();
      NotificationsStore.decreaseUnseen();
      this._markAsRead(ev.target.notificationId, function (err, res) {
        if (err) return console.log(res);
        if (ev.redirectUrl) window.location = ev.redirectUrl;
      });
    },

    /* NotificationItem 'notification:markAsRead' event handler.
     * @private
     */
    _notificationMarkAsReadHandler: function _notificationMarkAsReadHandler(ev) {
      ev.stopPropagation();
      NotificationsStore.decreaseUnseen();
      this._markAsRead(ev.target.notificationId, function (err, res) {
        if (err) return console.log(res);
        NotificationsStore.reFetchNotifications();
      });
    },

    _markAsRead: function _markAsRead(notificationId, callback) {
      API.markNotificationAsRead({
        profileName: Person.get('profileName'),
        data: {notificationId: notificationId}
      }, function(err, res) {
        callback(err, res);
      });
    },

    /* Handle the _window scroll event.
     * @private
     */
    _scrollHandler: function _scrollHandler(ev) {
      var el = ev.currentTarget;
      if ((el.scrollY + el.innerHeight) >= this._body.scrollHeight) {
        NotificationsStore.fetchNotifications();
      }
    }
  }
});
