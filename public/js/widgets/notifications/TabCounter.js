var favico = require('favico.js')
  , NotificationsStore = require('./../../stores/NotificationsStore');

Class(CV, 'TabCounter')({
  prototype: {
    _unseen_total: 0,
    favicon: null,

    init: function init() {
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.favicon = new favico({
        animation:'none'
      });
      return this;
    },

    /* Subscribe to NotificationsStore.
     * @private
     * @return {Object} this
     */
    _bindEvents: function _bindEvents() {
      this._unseenNotificationsHandlerRef = this._unseenNotificationsHandler.bind(this);
      NotificationsStore.bind('unseenNotifications', this._unseenNotificationsHandlerRef);
      return this;
    },

    /* NotificationsStore 'unseenNotifications' event handler.
     * @private
     * @param {Object} res
     * @prototype {number} res.unseen
     */
    _unseenNotificationsHandler: function _unseenNotificationsHandler(res) {
      var total = res.unseen;
      if (this._unseen_total !== total) {
        this._unseen_total = total;
        this.favicon.badge(this._unseen_total);
      }
    }
  }
});
