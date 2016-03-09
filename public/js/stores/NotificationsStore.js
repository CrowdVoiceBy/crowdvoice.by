/* Handles the notifications data fetching and emits events letting its
 * subscribers to know when it changes so they can update itself.
 */
var API = require('./../lib/api')
  , Person = require('./../lib/currentPerson');

module.exports = Class(CV, 'NotificationsStore').includes(CustomEventSupport)({
  _socket: null,
  _run: function _run() {
    this._socket = CV.App.getSocket();
    this._new_notifications = [];
    this._socket.on('newNotifications', this._newNotificationsHandler.bind(this));
    this._socket.emit('getNotifications');
  },

  /* @property {Number} _unseen_count - Holds the unseen notifications total.
   * @private
   */
  _notifications: null,
  _notificationsFetched: false,
  _notificationsTotalCount: 0,
  _notificationsLimit: 10,
  _notificationsRequests: 0,
  _unseen_count: 0,
  _new_notifications: null,

  fetchNotifications: function fetchNotifications() {
    if (this._notifications && this._notifications.length) {
      if (this._notifications.length >= this._notificationsTotalCount) {
        return;
      }
    }

    this._notificationsFetched = true;

    API.getNotifications({
      profileName: Person.get('profileName'),
      data: {
        limit: this._notificationsLimit,
        offset: this._notificationsRequests * this._notificationsLimit
      }
    }, function (err, res) {
      if (err) return console.log(err);
      if (this._notifications) {
        this._notifications = this._notifications.concat(res.notifications);
      } else {
        this._notifications = res.notifications;
      }
      this._notificationsRequests++;
      this._notificationsTotalCount = res.totalCount;
      this._emitNotifications();
    }.bind(this));
  },

  reFetchNotifications: function reFetchNotifications() {
    API.getNotifications({
      profileName: Person.get('profileName'),
      data: {
        limit: (this._notificationsLimit * this._notificationsRequests)
      }
    }, function (err, res) {
      if (err) return console.log(err);
      this._notifications = res.notifications;
      this._notificationsTotalCount = res.totalCount;
      this._emitNotifications();
    }.bind(this));
  },

  getNotifications: function getNotifications() {
    this._emitNotifications();
  },

  _emitNotifications: function _emitNewNotifications() {
    this.dispatch('notifications', {notifications: this._notifications});
  },

  /* Decrease the _unseen_count by one and emits the unseenNotifications event.
   * @public, static
   * @emits 'unseenNotifications'
   */
  decreaseUnseen: function decreaseUnseen() {
    if (this._unseen_count > 0) {
      this._unseen_count--;
      this._emitUnseenNotifications();
    }
  },

  /* Deletes a new notification from the Store.
   * @public, static
   */
  deleteNewNotification: function deleteNewNotification(id) {
    if (!id) return;
    this._new_notifications.some(function (n, i, a) {
      if (n.notificationId === id) {
        a.splice(i, 1);
        return true;
      }
    });
  },

  /* Deletes all newNotifications from the Store.
   * @public, static
   */
  deleteAllNewNotifications: function deleteAllNewNotifications() {
    this._new_notifications = [];
    this._unseen_count = 0;
    this._emitUnseenNotifications();
    this._emitNewNotifications();
  },

  _newNotificationsHandler: function _newNotificationsHandler(res) {
    if (res.length) {
      this._new_notifications = this._new_notifications.concat(res);
      this._unseen_count += res.length;
      this._emitNewNotifications();
      this._emitUnseenNotifications();

      if (this._notificationsFetched) {
        this.reFetchNotifications();
      }
    }
  },

  /* @emits 'unseenNotifications' {unseen: {number}}
   * @private
   */
  _emitUnseenNotifications: function _emitUnseenNotifications() {
    this.dispatch('unseenNotifications', {unseen: this._unseen_count});
  },

  /* @emits 'newNotifications' {notifications: {array}}
   */
  _emitNewNotifications: function _emitNewNotifications() {
    this.dispatch('newNotifications', {notifications: this._new_notifications.reverse()});
  }
});

setTimeout(function () {
  if (Person.get()) {
    CV.NotificationsStore._run();
  }
}, 0);

