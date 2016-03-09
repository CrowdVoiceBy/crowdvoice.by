/* globals App */
var Events = require('../../../lib/events');

Class(CV, 'VoicePublishOnboardingAddContent').inherits(Widget)({
  ELEMENT_CLASS: '-pl2 -pr2 -pb2',
  HTML: '\
    <div>\
      <p class="-mb1">Use this button to <span class="-font-bold">add content</span> from any source.\
      <br/>Add your first post!</p>\
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
        data: {value: 'Next'}
      })).render(this.el);

      return this;
    },

    _bindEvents: function _bindEvents() {
        this._clickHandlerRef = this._clickHandler.bind(this);
        Events.on(this.button.el, 'click', this._clickHandlerRef);
    },

    _clickHandler: function _clickHandler() {
      this.parent.deactivate();

      if (!App.Voice.voiceAddContent) return;

      App.Voice.voiceAddContent.addPostBubble.activate();
    },

    destroy: function destroy() {
      Events.off(this.button.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;

      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
