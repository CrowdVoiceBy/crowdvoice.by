/* Creates a new HoverCard Widget. For the sake of simplicity we will only use
 * one single instance across the whole application, that instance will be
 * reused. The way we can use this HoverCard widget is:
 * 1. create a new global instance and render it.
 *   @example CardHoverWidget = new CV.CardHover().render(document.body);
 * 2. register as much hoverable elements as needed using the `register` method.
 *   @example CardHoverWidget.register(anchorElement, EntityDataModel);
 * 3. unregister the hoverable elements if needed.
 *   @example CardHoverWidget.unregister(anchorElement);
 */
var Events = require('./../../lib/events');
var inlineStyle = require('./../../lib/inline-style');

Class(CV, 'CardHover').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'widget-card-hover-container',

  prototype: {
    _cardWidget : null,
    _clientHeightHalf : 0,
    _clientWidth : 0,
    _isHoverCard : false,
    _DO_NOT_CLOSE : false,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._bindEvents();
      this._updateVariables();
    },

    /* Register a new HoverCardItem. This is how we can easily register a
     * new CardHoverItems, this will handle all the require events and
     * interaction for you.
     * @method register <public> [Function]
     * @argument nodeElement <required> [Function]
     * @argument entityData <required> [EntityModel]
     * @usage window.CardHoverWidget.register(hoverElement, EntityDataModel);
     * @return CardHover
     */
    register: function register(nodeElement, entityData) {
      if (entityData.isAnonymous) { return; }

      this.appendChild(new CV.CardHoverItem({
        element : nodeElement,
        data : entityData
      }));

      return this;
    },

    /* Unregister a HoverCardItem. Clears event listeners, and destroys
     * the widget.
     * @method unregister <public> [Function]
     * @argument nodeElement <required> [NodeElement] the previously passed
     * NodeElement passed via the `register` method.
     * @usage CardHoverWidget.unregister(hoverElement);
     * @return null
     */
    unregister: function unregister(nodeElement) {
      this.children.some(function(item) {
        if (item.el === nodeElement) {
          item.destroy();
          return true;
        }
      }, this);
      return null;
    },

    /* Updates the widget contents and position.
     * @method update <protected> [Function]
     * @argument el <required> [NodeElement] the reference element to position the widget.
     * @argument data <required> [EntityModel] the Entity data.
     */
    update: function update(el, data) {
      var bounds = el.getBoundingClientRect();
      var cardHeight, cardWidth, top, left, transform, transition;

      this.active = true;

      if (this._cardWidget) {
        this._cardWidget = this._cardWidget.destroy();
      }

      if (this.el.nextElementSibling) {
        document.body.appendChild(this.el);
      }

      this.appendChild(new CV.CardSmall({
        name: '_cardWidget',
        data: data
      })).render(this.el);

      this.el.style.display = 'block';

      cardHeight = this.el.offsetHeight;
      cardWidth = this.el.offsetWidth;

      if (bounds.top > this._clientHeightHalf) {
        top = (bounds.top - cardHeight);
        transform = 'translateY(-10px)';
      } else {
        top = (bounds.top + bounds.height);
        transform = 'translateY(10px)';
      }

      if ((bounds.left + cardWidth) > this._clientWidth) {
        left = (bounds.left - (cardWidth - bounds.width));
      } else {
        left = bounds.left;
      }

      inlineStyle(this.el, {
        top: top + 'px',
        left: left + 'px',
        msTransform: transform,
        webkitTransform: transform,
        transform: transform,
        willChange: 'transform, opacity'
      });

      window.setTimeout(function () {
        transform = 'translateY(0)';
        transition = 'transform 160ms ease-out, opacity 160ms linear';

        inlineStyle(this.el, {
          opacity: '1',
          webkitTransition: transition,
          transition: transition,
          msTransform: transform,
          webkitTransform: transform,
          transform: transform
        });
      }.bind(this), 0);
    },

    /* Checks if the HoverCard should be hidden, if so it will hide it.
     * @method hide <protected> [Function]
     * @return undefined
     */
    hide: function hide() {
      if (this._isHoverCard === true) { return; }

      if (this._cardWidget) {
        this._cardWidget = this._cardWidget.destroy();
      }

      this.active = false;

      inlineStyle(this.el, {
        display: 'none',
        opacity: '0',
        webkitTransition: 'none',
        transition: 'none',
        msTransform: 'none',
        webkitTransform: 'none',
        transform: 'none',
        willChange: 'none'
      });
    },

    _bindEvents: function _bindEvents() {
      Events.on(window, 'resize', this._updateVariables);

      this._yieldScrollHandlerRef = this._scrollHandler.bind(this);
      Events.on(window, 'scroll', this._yieldScrollHandlerRef);

      this._mouseEnterHandlerRef = this._mouseEnterHandler.bind(this);
      Events.on(this.el, 'mouseenter', this._mouseEnterHandlerRef);

      this._mouseLeaveHandlerRef = this._mouseLeaveHandler.bind(this);
      Events.on(this.el, 'mouseleave', this._mouseLeaveHandlerRef);

      this._cardActionPopoverActiveListenerRef = this._cardActionPopoverActiveListener.bind(this);
      this.bind('card:action:popover:active', this._cardActionPopoverActiveListenerRef);

      this._cardActionPopoverDeactiveListenerRef = this._cardActionPopoverDeactiveListener.bind(this);
      this.bind('card:action:popover:deactive', this._cardActionPopoverDeactiveListenerRef);

      return this;
    },

    _updateVariables: function _updateVariables() {
      this._clientHeightHalf = (window.innerHeight / 2);
      this._clientWidth = window.innerWidth;
    },

    _scrollHandler: function _scrollHandler() {
      if (this.active) {
        this._isHoverCard = false;
        this._DO_NOT_CLOSE = false;
        this.hide();
      }
    },

    _mouseEnterHandler: function _mouseEnterHandler() {
      this._isHoverCard = true;
    },

    _mouseLeaveHandler: function _mouseLeaveHandler() {
      this._isHoverCard = false;
      if (this._DO_NOT_CLOSE) {
        return;
      }
      this.hide();
    },

    _cardActionPopoverActiveListener: function _cardActionPopoverActiveListener(ev) {
      ev.stopPropagation();
      this._DO_NOT_CLOSE = true;
    },

    _cardActionPopoverDeactiveListener: function _cardActionPopoverDeactiveListener(ev) {
      ev.stopPropagation();
      window.setTimeout(function() {
        this._DO_NOT_CLOSE = false;
      }.bind(this), 100);
    }
  }
});
