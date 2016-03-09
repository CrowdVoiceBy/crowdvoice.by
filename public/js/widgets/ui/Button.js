/* @example
 * new CV.UI.Button({data: {value: 'Button Text'}});
 */
Class(CV.UI, 'Button').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'cv-button',
  HTML: '<button></button>',
  prototype: {
    data: {
      value: ''
    },

    init: function init(config) {
      if (config.data && config.data.href) {
        this.element = $('<a class="cv-button"/>');
        this.element[0].setAttribute('href', config.data.href);
      }

      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      if (this.data.value) {
        this.updateText(this.data.value);
      }

      if (this.data.attr) {
        Object.keys(this.data.attr).forEach(function(propertyName) {
          this.dom.updateAttr(propertyName, this.el, this.data.attr[propertyName]);
        }, this);
      }
    },

    updateText: function updateText(text) {
      this.dom.updateText(this.el, text);
      return this;
    },

    updateHTML: function updateHTML(string) {
      this.dom.updateHTML(this.el, string);
      return this;
    },

    _enable: function _enable() {
      Widget.prototype._enable.call(this);
      this.el.removeAttribute('disabled');
    },

    _disable: function _disable() {
      Widget.prototype._disable.call(this);
      this.el.setAttribute('disabled', true);
    }
  }
});
