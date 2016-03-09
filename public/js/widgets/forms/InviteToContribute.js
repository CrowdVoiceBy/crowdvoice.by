var Person = require('./../../lib/currentPerson')
  , API = require('./../../lib/api')
  , Events = require('./../../lib/events')
  , Checkit = require('checkit');

Class(CV, 'InviteToContribute').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'cv-form-invite-to-contribute',
  HTML: '\
    <div>\
      <div data-placeholder-main></div>\
      <div data-placeholder-send></div>\
    </div>',

  prototype: {
    /* Entity Model to invite */
    data: null,
    _flashMessage: null,
    init: function(config){
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      this.checkit = new Checkit({
        message: ['required'],
        voicesDropdown: ['required']
      });

      this._setup()._bindEvents();
    },

    /* Append and render its children components.
     * @private
     */
    _setup: function _setup() {
      this.appendChild(new CV.UI.DropdownInviteToVoice({
        name: 'inviteVoicesDropdown',
        data: {
          label: 'To which of your voices would you like to invite this user to?'
        },
        entity: this.data
      })).render(this.el.querySelector('[data-placeholder-main]')).selectByIndex(0);

      this.appendChild(new CV.UI.Input({
        name: 'inviteMessage',
        data: {
          label: "Write a message",
          isTextArea: true,
          inputClassName: '-full-width',
          attr: {
            rows: 2
          }
        }
      })).render(this.el.querySelector('[data-placeholder-main]'));
      this.inviteMessage.setValue('Hey ' + this.data.name + '! Do you want to become a contributor in our voice? Let’s rise our voice together!');

      this.appendChild(new CV.UI.Button({
        name: 'buttonSend',
        className: 'primary -font-bold -full-width -m0',
        data: {value: 'Invite ' + this.data.name}
      })).render(this.el.querySelector('[data-placeholder-send]'));

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._sendClickHandlerRef = this._sendClickHandler.bind(this);
      Events.on(this.buttonSend.el, 'click', this._sendClickHandlerRef);
      return this;
    },

    /* Send button click handler.
     * @private
     */
    _sendClickHandler: function _sendClickHandler() {
      var validate = this.checkit.validateSync({
        message: this.inviteMessage.getValue(),
        voicesDropdown: this.inviteVoicesDropdown.getValue()
      });

      if (validate[0]) {
        return this._displayErrors(validate[0].errors);
      }

      this._setSendingState();

      API.sendInvitation({
        profileName: Person.get().profileName,
        data: this._dataPresenter()
      }, this._sendMessageResponse.bind(this));
    },

    /* Handles the API call response.
     * @private
     */
    _sendMessageResponse: function _sendMessageResponse(err, res) {
      if (err) {
        this._setErrorState(res.status + ': ' + res.statusText);
        return;
      }

      this._setSuccessState();
      this._clearForm();
    },

    /* Display the current form errors.
     * @private
     */
    _displayErrors: function _displayErrors(errors) {
      Object.keys(errors).forEach(function(propertyName) {
        var widget = 'invite' + this.format.capitalizeFirstLetter(propertyName);
        this[widget].error();
      }, this);
    },

    _setSendingState: function _setSendingState() {
      this.buttonSend.disable();
      return this;
    },

    /* Sets the success state of the form.
     * @private
     */
    _setSuccessState: function _setSuccessState() {
      this.buttonSend.enable();

      if (this._flashMessage) {
        return this._flashMessage.update({
          type: 'positive',
          text: 'Invitation to ' + this.data.name + ' has been sent.'
        }).shake();
      }

      this.appendChild(new CV.Alert({
        name: '_flashMessage',
        type: 'positive',
        text: 'Invitation to ' + this.data.name + ' has been sent.',
        className: '-mb1'
      })).render(this.el, this.el.firstElementChild);
    },

    /* Sets the error state of the form.
     * @private
     */
    _setErrorState: function _setErrorState(msg) {
      this.buttonSend.enable();

      if (this._flashMessage) {
        return this._flashMessage.update({
          type: 'negative',
          text: msg || 'There was an error sending your invitation to ' + this.data.name
        }).shake();
      }

      this.appendChild(new CV.Alert({
        name: '_flashMessage',
        type: 'negative',
        text: msg || 'There was an error sending your invitation to ' + this.data.name,
        className: '-mb1'
      })).render(this.el, this.el.firstElementChild);
    },

    /* Clears the form.
     * @private
     */
    _clearForm: function _clearForm() {
      this.inviteMessage.setValue('');
      return this;
    },

    /* Returns the data to be sent to server to create a new Voice.
     * @private
     */
    _dataPresenter: function _dataPresenter() {
      return {
        type: 'invitation_voice',
        receiverEntityId: this.data.id,
        voiceId: this.inviteVoicesDropdown.getValue(),
        message: this.inviteMessage.getValue()
      };
    },

    destroy: function destroy() {
      Events.off(this.buttonSend.el, 'click', this._sendClickHandlerRef);
      this._sendClickHandlerRef = null;
      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
