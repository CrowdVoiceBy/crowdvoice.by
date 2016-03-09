var Checkit = require('checkit')
  , API = require('./../../lib/api')
  , Events = require('./../../lib/events');

Class(CV.Forms, 'VoicePublish').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'cv-form-publish-voice',

  HTML: '\
    <div>\
      <p class="form-publish-voice__text -mb2">Great! Just choose how would you like people to find and view. <span data-voice-title class="-color-black -font-bold"></span>.</p>\
    </div>',

  prototype: {
    checkit: null,
    _flashMessage: null,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      this.checkit = new Checkit({
        status: 'required'
      });

      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      if (!this.data.voice) return this;

      this.dom.updateText(this.el.querySelector('[data-voice-title]'), this.data.voice.title);

      this.appendChild(new CV.VoiceStatusOptions({
        name: 'voiceStatus'
      })).render(this.el);

      this.appendChild(new CV.UI.Button({
        name: 'buttonSend',
        className: 'primary full',
        data: {value: 'Publish Voice'}
      })).render(this.el).disable();

      this.el.insertAdjacentHTML('beforeend', '<p class="form-publish-voice__bottom-help-text -mt2 -text-center">You can change this later via the edit voice options.</p>');

      return this;
    },

    _bindEvents: function _bindEvents() {
      if (!this.data.voice) return this;

      this._statusOptionChangedRef = this._statusOptionChanged.bind(this);
      this.voiceStatus.bind('optionChanged', this._statusOptionChangedRef);

      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.buttonSend.el, 'click', this._clickHandlerRef);
    },

    _statusOptionChanged: function _statusOptionChanged(ev) {
      ev.stopPropagation();
      this.buttonSend[ev.target.getValue() ? 'enable' : 'disable']();
    },

    _clickHandler: function _clickHandler() {
      var validate = this.checkit.validateSync(this._getCurrentData());

      if (validate[0]) {
        return this._displayErrors(validate[0].errors);
      }

      this._setSendingState();

      API.voiceEdit({
        profileName: this.data.voice.owner.profileName,
        voiceSlug: this.data.voice.slug,
        data: this._dataPresenter()
      }, function (err, res) {
        console.log(err);
        console.log(res);
        if (err) return this._setErrorState(res.status + ': ' + res.statusText);
        this._setSuccessState(res);
      }.bind(this));
    },

    /* Returns the data to be validated using Checkit module
     * @protected
     */
    _getCurrentData: function _getCurrentData() {
      return {
        status: this.voiceStatus.getValue()
      };
    },

    /* Display the current form errors.
     * @protected
     * @errors {Object} errors - checkit errors object.
     */
    _displayErrors: function _displayErrors(errors) {
      Object.keys(errors).forEach(function(propertyName) {
        var widget = 'voice' + this.format.capitalizeFirstLetter(propertyName);
        this[widget].error();
      }, this);
    },

    /* Sets the error state of the form.
     * @protected
     * @param {String} message - the error message to display
     */
    _setErrorState: function _setErrorState(message) {
      this.buttonSend.enable();

      if (this._flashMessage) {
        return this._flashMessage.update({
          type: 'negative',
          text: message
        }).shake();
      }

      this.appendChild(new CV.Alert({
        name: '_flashMessage',
        type: 'negative',
        text: message,
        className: '-mb1'
      })).render(this.el, this.el.firstElementChild);
    },

    _setSendingState: function _setSendingState() {
      this.buttonSend.disable();
    },

    /* Sets the success state of the form.
     * @private
     */
    _setSuccessState: function _setSuccessState(res) {
      var message = '“' + res.title + '” was published!';

      if (this._flashMessage) {
        this._flashMessage.update({
          type: 'positive',
          text: message
        }).shake();
      } else {
        this.appendChild(new CV.Alert({
          name: '_flashMessage',
          type: 'positive',
          text: message,
          className: '-mb1'
        })).render(this.el, this.el.firstElementChild);
      }

      window.setTimeout(function () {
        window.location.reload();
      }, 2000);
    },

    /* Returns the data to be sent to server to update current voice.
     * @private
     */
    _dataPresenter: function _dataPresenter() {
      var data = new FormData();
      data.append('status', this.voiceStatus.getValue());
      return data;
    }
  }
});
