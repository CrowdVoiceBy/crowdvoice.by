var Events = require('../../../lib/events');

Class(CV, 'VoicePublishOnboardingCan').inherits(Widget)({
  HTML: '\
    <div>\
      <p class="-mb1">Make sure you explore the <b>Edit Voice Settings</b> to update visibility options, content controls and more!</p>\
    </div>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.appendChild(new CV.UI.Button({
        name: 'button',
        className: 'tiny',
        data: {value: 'Ok'}
      })).render(this.el);

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.button.el, 'click', this._clickHandlerRef);
    },

    _clickHandler: function _clickHandler() {
      this.parent.deactivate();
    },

    destroy: function destroy() {
      Events.off(this.button.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;

      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
