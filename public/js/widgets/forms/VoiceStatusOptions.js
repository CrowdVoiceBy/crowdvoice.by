var constants = require('./../../lib/constants');

Class(CV, 'VoiceStatusOptions').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'voice-form__status-wrapper',

  HTML: '\
    <div class="ui-form-field">\
      <label class="-block">\
        <span class="ui-input__label -upper -font-bold">Voice Visibility</span>\
      </label>\
      <div class="-row">\
        <div data-public class="-col-6"></div>\
        <div data-unlisted class="-col-6 -pl1"></div>\
      <div>\
    </div>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.appendChild(new CV.UI.Radio({
        name: 'public',
        className: 'voice-form__status-item -block',
        data: {
          label: 'Public',
          attr: {
            name: 'voice-status-radios',
            value: constants.VOICE.STATUS_PUBLISHED
          }
        }
      })).render(this.el.querySelector('[data-public]'));
      this.public.el.querySelector('label').insertAdjacentHTML('beforeend', '<p class="voice-form__status-item-desc -ml2">Visible everywhere. Your followers will be notified when you publish for the first time.</p>');

      this.appendChild(new CV.UI.Radio({
        name: 'unlisted',
        className: 'voice-form__status-item -block',
        data: {
          label: 'Unlisted',
          attr: {
            name: 'voice-status-radios',
            value: constants.VOICE.STATUS_UNLISTED
          }
        }
      })).render(this.el.querySelector('[data-unlisted]'));
      this.unlisted.el.querySelector('label').insertAdjacentHTML('beforeend', '<p class="voice-form__status-item-desc -ml2">Accessible only to those with the link. it won’t be visible in voice listings or your public profile.</p>');

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._statusChangedRef = this._statusChanged.bind(this);

      this.children.forEach(function (radio) {
        radio.bind('changed', this._statusChangedRef);
      }, this);
    },

    _statusChanged: function _statusChanged(ev) {
      ev.stopPropagation();
      this.children.forEach(function (radio) {
        radio[radio.isChecked() ? 'activate' : 'deactivate']();
      }, this);

      this.clearState();
      this.dispatch('optionChanged');
    },

    selectByValue: function selectByValue(value) {
      this.children.some(function (item) {
        if (item.radio.value === value) {
          item.check();
          return true;
        }
      });
    },

    /* Returns the current selected option data.
     * @public
     */
    getValue: function getValue() {
      var value;
      this.children.some(function (item) {
        if (item.radio.checked) {
          value = item.radio.value;
          return true;
        }
      });
      return value;
    },

    clearState: function clearState() {
      this.dom.removeClass(this.el, ['-is-error']);
      return this;
    },

    /* Sets error state.
     * @method error <public>
     */
    error: function error() {
      this.dom.addClass(this.el, ['-is-error']);
      return this;
    }
  }
});
