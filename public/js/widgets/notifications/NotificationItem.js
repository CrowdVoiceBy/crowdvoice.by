var Events = require('./../../lib/events');

Class(CV, 'NotificationItem').inherits(CV.Notification)({
  HTML: '\
    <div>\
      <div class="cv-notification__info"></div>\
      <div class="cv-notification__close -clickable -abs -full-height">\
        <svg class="-s9">\
          <use xlink:href="#svg-close"></use>\
        </svg>\
      </div>\
    </div>',

  LIFE_TIME_SPAN: 5000,

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
    _lifeTimeout: null,

    init: function init(config) {
      CV.Notification.prototype.init.call(this, config);
      this.el = this.element[0];
      this.closeElement = this.el.querySelector('.cv-notification__close');
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.appendChild(CV.FeedItem.create({
        name: 'item',
        data: this.data
      })).render(this.el.querySelector('.cv-notification__info'));
      this.activate();
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._mouseEnterHandlerRef = this._mouseEnterHandler.bind(this);
      Events.on(this.el, 'mouseenter', this._mouseEnterHandlerRef);

      this._mouseLeaveHandlerRef = this._mouseLeaveHandler.bind(this);
      Events.on(this.el, 'mouseleave', this._mouseLeaveHandlerRef);

      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.el, 'click', this._clickHandlerRef);

      this._closeClickHandlerRef = this._closeClickHandler.bind(this);
      Events.on(this.closeElement, 'click', this._closeClickHandlerRef);
      return this;
    },

    /* Notification mouseenter event handler.
     * @private
     */
    _mouseEnterHandler: function _mouseEnterHandler() {
      if (this.read === false) {
        this.read = true;
        this.dispatch('notification:markAsRead');
      }
      this._stopLifeSpanCount();
    },

    _mouseLeaveHandler: function _mouseLeaveHandler() {
      this._restartLifeSpanCount();
    },

    _clickHandler: function _clickHandler(ev) {
      var tag = ev.target.tagName.toUpperCase()
        , link = this.item.getLink();
      if (tag !== 'A') {
        ev.preventDefault();
        if (link) window.location = link;
      }
    },

    /* Notification close button click handler.
     * @private
     */
    _closeClickHandler: function _closeClickHandler(ev) {
      ev.stopImmediatePropagation();
      this._dispatchTimeEnd();
    },

    _startLifeSpanCount: function _startLifeSpanCount() {
      this._stopLifeSpanCount();
      this._lifeTimeout = window.setTimeout(function (_this) {
        _this._dispatchTimeEnd();
      }, this.constructor.LIFE_TIME_SPAN, this);
    },

    _dispatchTimeEnd: function _dispatchTimeEnd() {
      window.clearTimeout(this._lifeTimeout);
      delete this._lifeTimeout;
      this.deactivate();
      this.dispatch('notification:timeSpanEnd');
    },

    _stopLifeSpanCount: function _stopLifeSpanCount() {
      if (this._lifeTimeout) {
        window.clearTimeout(this._lifeTimeout);
        delete this._lifeTimeout;
      }
    },

    _restartLifeSpanCount: function _restartLifeSpanCount() {
      this._stopLifeSpanCount();
      this._startLifeSpanCount();
    },

    /* @override
     */
    render: function render(element, beforeElement) {
      Widget.prototype.render.call(this, element, beforeElement);
      this._startLifeSpanCount();
      return this;
    },

    /* @override
     */
    destroy: function destroy() {
      if (this._lifeTimeout) {
        window.clearTimeout(this._lifeTimeout);
        delete this._lifeTimeout;
      }

      Events.off(this.closeElement, 'click', this._closeClickHandlerRef);
      this._closeClickHandlerRef = null;
      Events.off(this.el, 'mouseenter', this._mouseEnterHandlerRef);
      this._mouseEnterHandlerRef = null;

      CV.Notification.prototype.destroy.call(this);
    }
  }
});
