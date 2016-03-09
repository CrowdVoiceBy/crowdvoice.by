var Events = require('./../../lib/events');

Class(CV.UI, 'Radio').inherits(Widget).includes(CV.WidgetUtils)({
  HTML: '\
    <div class="ui-radio">\
      <label>\
        <input class="ui-radio-radio" type="radio"/>\
        <span class="ui-radio-element">\
          <svg class="-s8">\
            <use xlink:href="#svg-dot"></use>\
          </svg>\
        </span>\
        <span class="ui-radio-label"></span>\
      </label>\
    </div>',

  prototype: {
    data: {
      label: '',
      checked: false
    },

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.radio = this.el.querySelector('.ui-radio-radio');
      this.labelElement = this.el.querySelector('.ui-radio-label');
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      if (this.data.label) {
        this.dom.updateText(this.labelElement, this.data.label);
      }

      if (this.data.checked) {
        this.check();
      }

      if (this.data.attr) {
        Object.keys(this.data.attr).forEach(function(propertyName) {
          this.dom.updateAttr(propertyName, this.radio, this.data.attr[propertyName]);
        }, this);
      }

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._changeHandler.bind(this);
      Events.on(this.radio, 'change', this._clickHandlerRef);
    },

    /* Returns the radio checked state.
     * @public
     * @return {Boolean} this.radio.radio
     */
    isChecked: function isChecked() {
      return this.radio.checked;
    },

    /* Sets the radio check property as `true`.
     * @public
     * @return Radio
     */
    check: function check() {
      this.radio.checked = true;
      this._changeHandler();
      return this;
    },

    /* Handles the radio `change` event.
     * @private
     */
    _changeHandler: function _changeHandler() {
      this.dispatch('changed');
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      Events.on(this.radio, 'change', this._clickHandlerRef);
      this._clickHandlerRef = null;
      return null;
    }
  }
});
