var Events = require('./../../lib/events');

Class(CV, 'CardHoverItem').inherits(Widget)({
  prototype: {
    data : null,
    _showHoverCard : false,
    _enterTimeout : null,
    _leaveTimeout : null,

    init : function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element;
      this._bindEvents();
    },

    _bindEvents : function _bindEvents() {
      this._mouseEnterHandlerRef = this._mouseEnterHandler.bind(this);
      Events.on(this.el, 'mouseenter', this._mouseEnterHandlerRef);

      this._mouseLeaveHandlerRef = this._mouseLeaveHandler.bind(this);
      Events.on(this.el, 'mouseleave', this._mouseLeaveHandlerRef);
    },

    _mouseEnterHandler : function _mouseEnterHandler(ev) {
      this._showHoverCard = true;

      this._enterTimeout = window.setTimeout(function(e) {
        window.clearTimeout(this._enterTimeout);

        if (this._showHoverCard === true) {
          window.CardHoverWidget.update(e.target, this.data);
        }
      }.bind(this, ev), 500);
    },

    _mouseLeaveHandler : function _mouseLeaveHandler() {
      this._showHoverCard = false;

      this._leaveTimeout = window.setTimeout(function() {
        window.clearTimeout(this._leaveTimeout);

        window.CardHoverWidget.hide();
      }.bind(this), 200);
    },

    destroy : function destroy() {
      Events.off(this.el, 'mouseenter', this._mouseEnterHandlerRef);
      this._mouseEnterHandlerRef = null;

      Events.off(this.el, 'mouseleave', this._mouseLeaveHandlerRef);
      this._mouseLeaveHandlerRef = null;

      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
