var Velocity = require('velocity-animate')
  , API = require('./../../lib/api')
  , Person = require('./../../lib/currentPerson')
  , NotificationsStore = require('./../../stores/NotificationsStore');

Class(CV, 'NotificationsManager').inherits(Widget).includes(BubblingSupport)({
  ELEMENT_CLASS: 'cv-notifications',

  HTML: '\
    <div>\
      <div class="cv-notifications-container">\
        <div class="cv-notifications-all"></div>\
      </div>\
    </div>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.elAll = this.element[0].querySelector(".cv-notifications-all");
      this._bindEvents();
    },

    _bindEvents: function _bindEvents() {
      this._newNotificationsHandlerRef = this._newNotificationsHandler.bind(this);
      NotificationsStore.bind('newNotifications', this._newNotificationsHandlerRef);

      this._notificationMarkAsReadHandlerRef = this._notificationMarkAsReadHandler.bind(this);
      this.bind('notification:markAsRead', this._notificationMarkAsReadHandlerRef);

      this._notificationTimeSpanEndHandlerRef = this._notificationTimeSpanEndHandler.bind(this);
      this.bind('notification:timeSpanEnd', this._notificationTimeSpanEndHandlerRef);
    },

    /* NotificationsStore 'newNotifications' event handler.
     * @private
     * @param {Object} res
     * @property {Array} res.notifications
     */
    _newNotificationsHandler: function _newNotificationsHandler(res) {
      this._update(res.notifications).activate();
    },

    /* NotificationItem 'notification:markAsRead' event handler.
     * @private
     */
    _notificationMarkAsReadHandler: function _notificationMarkAsReadHandler(ev) {
      ev.stopPropagation();
      NotificationsStore.decreaseUnseen();
      NotificationsStore.deleteNewNotification(ev.target.notificationId);

      API.markNotificationAsRead({
        profileName: Person.get().profileName,
        data: {notificationId: ev.target.notificationId}
      }, function(err, res) {
        if (err) return console.log(res);
      });
    },

    /* NotificationItem 'notification:timeSpanEnd' event handler.
     * @private
     */
    _notificationTimeSpanEndHandler: function _notificationTimeSpanEndHandler(ev) {
      var _self = this
        , child = ev.target;

      ev.stopPropagation();
      NotificationsStore.deleteNewNotification(child.notificationId);

      function checkIfShouldRemoveChildren() {
        if (_self.children.every(function _isDeactivated(child) {
          return child.active === false;
        })) _self._empty();
      }

      Velocity(child.el, {opacity: 0}, {
        duration: 500,
        complete: function () {
          child.el.style.visibility = 'hidden';
          checkIfShouldRemoveChildren();
        }
      });
    },

    /* Updates the displayed notifications with the passed ones.
     * @private
     * @param {Array} notifications - Array of Objects, each Object should
     * be a modified FeedPresenter, with an extra property `notificationId`
     * that holds the encoded notificationId.
     * @return NotificationsManager
     */
    _update: function _update(notifications) {
      var _this = this
        , fragment = document.createDocumentFragment();
      _this._empty();
      // if (notifications.length > 4) notifications = notifications.splice(0, 4);
      notifications.forEach(function(n) {
        _this.appendChild(new CV.NotificationItem({
          name: n.notificationId,
          data: n.action,
          notificationId: n.notificationId,
          read: n.read
        })).render(fragment);
      });
      _this.elAll.appendChild(fragment);
      return _this;
    },

    /* Removes all the children `notifications`.
     * @private
     * @return NotificationsManager
     */
    _empty: function _empty() {
      while(this.children.length > 0) {
        this.children[0].destroy();
      }
      return this;
    },

    /* @override
     */
    _activate: function _activate() {
      Widget.prototype._activate.call(this);
      Velocity(this.el, 'fadeIn', {
        duration: 120
      });
    },

    /* @override
     */
    _deactivate: function _deactivate() {
      Widget.prototype._deactivate.call(this);
      Velocity(this.el, 'fadeOut', {
        duration: 120
      });
    }
  }
});
