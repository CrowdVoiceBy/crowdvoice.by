var Events = require('./../../lib/events');

Class(CV, 'NotificationsPopoverItem').inherits(Widget).includes(BubblingSupport)({
  ELEMENT_CLASS: 'cv-notification-popover-item -clickable',
  prototype: {
    /* @property {object} data The notification model.
     * @property {string} data.id
     * @property {string} data.action @ex 'followed you'.
     * @property {object} data.actionDoer The doer entity model.
     * @property {string} data.itemType @ex 'entity', 'voice'
     * @property {object[]} data.entity The affected entity model. (if itemType is 'entity')
     * @property {object[]} data.voice The affected voice model. (if itemType  is 'voice')
     * @property {date} data.createdAt
     * @property {date} data.updatedAt
     */
    data: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      if (this.read === false) {
        this.element.addClass('-is-unread');
      }

      this.appendChild(CV.FeedItem.create({
        name: 'item',
        data: this.data,
      })).render(this.element[0]);
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.element[0], 'click', this._clickHandlerRef);
    },

    _clickHandler: function _clickHandler(ev) {
      var tag = ev.target.tagName.toUpperCase()
        , link = this.item.getLink();
      if (tag !== 'A') {
        ev.preventDefault();
        if (this.read === false) {
          return this.dispatch('notification:markAsReadAndRedirect', {
            redirectUrl: link
          });
        }
        if (link) window.location = link;
      }
    },

    destroy: function destroy() {
      Events.off(this.element[0], 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
