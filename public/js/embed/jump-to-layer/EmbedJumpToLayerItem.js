var Events = require('./../../lib/events');

Class(CV, 'EmbedJumpToLayerItem').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS :'voice-timeline-popover_option ui-vertical-list-item',

  HTML : '\
    <div>\
      <svg class="option-svg -color-primary -abs">\
        <use xlink:href="#svg-checkmark"></use>\
      </svg>\
      <span class="option-label"></span>\
      <span class="cv-caption -font-normal -color-neutral-mid"></span>\
    </div>',

  prototype: {
    init : function init(config) {
      Widget.prototype.init.call(this, config);

      this.el = this.element[0];
      this.labelElement = this.el.querySelector('.option-label');
      this.counterElement = this.el.querySelector('.cv-caption');

      this.dom.updateText(this.labelElement, this.label);
      this.dom.updateText(this.counterElement, '(' + this.totalPosts + ')');

      this._bindEvents();
    },

    /* Subscribe to the wiget’s events.
     * @private
     */
    _bindEvents : function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.el, 'click', this._clickHandlerRef);
      return this;
    },

    /* Handles the item click event.
     * @private
     */
    _clickHandler : function _clickHandler() {
      this.dispatch('jumpToLayerItemClicked', {
        page: this.page,
        dateString: this.date
      });
    },

    destroy : function destroy() {
      Widget.prototype.destroy.call(this);
      Events.off(this.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      return null;
    }
  }
});
