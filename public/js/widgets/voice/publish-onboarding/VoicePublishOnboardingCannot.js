/* globals App */
var Events = require('../../../lib/events');

Class(CV, 'VoicePublishOnboardingCannot').inherits(Widget)({
  HTML: '\
    <div>\
      <p class="-mb1">We take extra special care on the quality of the content. Help us out crafting your voice responsibly. To publish your voice we require you to:</p>\
      <ul data-constraints-wrapper class="-mb1 -list-clean"></ul>\
      <p class="-mb1">Make sure you explore the <b>Voice Settings</b> to update visibility options, content controls and more!</p>\
    </div>',

  CHECK_CONSTRAINT_TEMPLATE: '\
    <li class="voice-onboarding__constraint">\
      <svg class="-s12 -color-positive">\
        <use xlink:href="#svg-checkmark"></use>\
      </svg>\
      <span class="-checked -font-bold -tdlt">{text}</span>\
    </li>',

  FAIL_CONSTRAINT_TEMPLATE: '\
    <li class="voice-onboarding__constraint">\
      <svg class="-s10 -color-negative">\
        <use xlink:href="#svg-close"></use>\
      </svg>\
      <span class="-font-bold">{text}</span>\
    </li>',


  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this._updateConstraints();

      this.appendChild(new CV.UI.Button({
        name: 'button',
        className: 'tiny',
        data: {value: 'Next'}
      })).render(this.el);

      return this;
    },

    _updateConstraints: function _updateConstraints() {
      if (Object.keys(this.data.voice.images).length) {
        this._addConstraint('Add a cover image', true);
      } else {
        this._addConstraint('Add a cover image');
      }

      if (this.data.voice.postsCount >= 20) {
        this._addConstraint('Add at least 20 posts', true);
      } else  {
        this._addConstraint('Add at least 20 posts');
      }
    },

    _addConstraint: function _addConstraint(text, checked) {
      var constraintsWrapper = this.el.querySelector('[data-constraints-wrapper]');

      if (checked) {
        return constraintsWrapper.insertAdjacentHTML('beforeend', this.constructor.CHECK_CONSTRAINT_TEMPLATE.replace(/{text}/, text));
      }

      return constraintsWrapper.insertAdjacentHTML('beforeend', this.constructor.FAIL_CONSTRAINT_TEMPLATE.replace(/{text}/, text));
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.button.el, 'click', this._clickHandlerRef);
    },

    _clickHandler: function _clickHandler() {
      this.parent.deactivate();

      if (!this.addContentOnboardingBubble) {
        if (!App.Voice.voiceAddContent) return;

        this.appendChild(new CV.PopoverBlocker({
          name: 'addContentOnboardingBubble',
          className: 'voice-raise-your-voice-bubble',
          placement: 'top-right',
          title: 'Raise Your Voice!',
          content: CV.VoicePublishOnboardingAddContent,
          showCloseButton: true
        })).render(document.querySelector('.voice-add-content'));
      }

      requestAnimationFrame(function () {
        this.addContentOnboardingBubble.activate();
      }.bind(this));
    },


    destroy: function destroy() {
      Events.off(this.button.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;

      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
