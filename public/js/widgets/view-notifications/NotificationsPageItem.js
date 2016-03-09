var Events = require('./../../lib/events');

Class(CV, 'NotificationsPageItem').inherits(Widget).includes(BubblingSupport)({
  ELEMENT_CLASS: 'cv-notification-page-item -clickable -mb1 -rel',
  TEMPLATE_MARK_AS_READ: '<a href="#" class="cv-notification-page-item-mark-as-read">Mark as Read</a>',
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
    markAsReadElement: null,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      if (this.read === false) {
        this._setUnreadState();
      }

      this.appendChild(CV.FeedItem.create({
        name: 'item',
        data: this.data,
      })).render(this.el, this.el.firstElementChild);
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.el, 'click', this._clickHandlerRef);
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

    _markAsReadHandler: function _markAsReadHandler(ev) {
      ev.preventDefault();
      this._setReadState();
      this.dispatch('notification:markAsRead');
    },

    _setUnreadState: function _setUnreadState() {
      this.element.addClass('-is-unread');
      this.el.insertAdjacentHTML('beforeend', this.constructor.TEMPLATE_MARK_AS_READ);
      this.markAsReadElement = this.el.querySelector('.cv-notification-page-item-mark-as-read');
      this._markAsReadHandlerRef = this._markAsReadHandler.bind(this);
      Events.on(this.markAsReadElement, 'click', this._markAsReadHandlerRef);
    },

    _setReadState: function _setReadState() {
      this.element.removeClass('-is-unread');
      Events.off(this.markAsReadElement, 'click', this._markAsReadHandlerRef);
      this._markAsReadHandlerRef = null;
      this.markAsReadElement.parentNode.removeChild(this.markAsReadElement);
      this.markAsReadElement = null;
    },

    destroy: function destroy() {
      Events.off(this.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
