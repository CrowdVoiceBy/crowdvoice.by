/* globals App */
var Labels = require('./../view-user-profile-edit/notifications/data-notification-labels')
  , Events = require('./../../lib/events')
  , API = require('./../../lib/api');

Class(CV, 'OrganizationProfileEditNotificationsTab').inherits(Widget)({
  HTML: '\
    <div>\
      <div class="-mb5">\
        <div class="form-field -mb0">\
          <label class="cv-items-list" style="padding-top: 0;">Notify Me</label>\
        </div>\
        <div data-notify-me-list></div>\
      </div>\
    </div>',

  prototype: {
    data: {
      notificationSettings: null,
      entity: null
    },

    _errorAlert: null,
    _successAlert: null,

    /* Holds the EditNotificationsNotifyMeItem widget references.
     * @property {Object} _notifyMeItems
     * @private
     */
    _notifyMeItems: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._notifyMeItems = [];

      this._setup()._bindEvents();
    },


    _setup: function _setup() {
      var notifyMeListElement = this.el.querySelector('[data-notify-me-list]');
      var formattedSettings = this._formatSettings(this.data.notificationSettings);

      Object.keys(formattedSettings).forEach(function(setting) {
        this._notifyMeItems.push(this.appendChild(new CV.EditNotificationsNotifyMeItem({
          name: setting,
          className: 'cv-items-list',
          data: {
            label: Labels[setting] || 'missing description',
            options: formattedSettings[setting]
          }
        })).render(notifyMeListElement));
      }, this);

      this.appendChild(new CV.UI.Button({
        name: 'saveButton',
        className: 'positive small',
        data: {value: 'Save Changes'},
      })).render(this.el);

      notifyMeListElement = formattedSettings = null;
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._saveButtonClickHandlerRef = this._saveButtonClickHandler.bind(this);
      Events.on(this.saveButton.el, 'click', this._saveButtonClickHandlerRef);
      return this;
    },

    /* Format notifications settings data to handle and display the interface.
     * The output will be something like this for each setting.
     *  {entityFollowsEntity :  [
     *      {label: 'webSettings',   checked: true},
     *      {label: 'emailSettings', checked: true }
     *  ]}, ...
     * @private
     * @return formatedData
     */
    _formatSettings: function _formatSettings(settings) {
      var results = {};
      var settingHumanLabel;

      Object.keys(settings || {}).forEach(function(settingsType) {
        settingHumanLabel = (settingsType === 'webSettings') ? 'Web' : 'Email';

        Object.keys(settings[settingsType]).forEach(function(settingType) {
          if (typeof results[settingType] === 'undefined') {
            results[settingType] = [];
          }

          results[settingType].push({
            settingsType: settingsType,
            label: settingHumanLabel,
            checked: settings[settingsType][settingType]
          });
        });
      });

      settingHumanLabel = null;

      return results;
    },

    _saveButtonClickHandler: function _saveButtonClickHandler() {
      this.saveButton.disable();

      API.updateNotificationSettings({
        profileName: this.data.entity.profileName,
        data : this._dataPresenter()
      }, function(err, res) {
        this.saveButton.enable();

        if (err) {
          return this._displayErrorAlert('There was a problem while trying to update your notification settings.');
        }

        if (res.status === 'updated settings') {
          this._displaySuccessAlert('Your notification settings have been updated.');
        }
      }.bind(this));
    },

    /* Formats the data to be sent to the server to update the notification
     * settings based on the interface checkboxes.
     * @private
     * @return {webSettings: {...}, emailSettings: {...}}
     */
    _dataPresenter: function _dataPresenter() {
      var data = {};
      this._notifyMeItems.forEach(function(item) {
        item.getSettingsState().forEach(function(option) {
          if (typeof data[option.type] === 'undefined') {
            data[option.type] = {};
          }
          data[option.type][item.name] = option.checked;
        });
      });
      return data;
    },

    /* Displays a success alert, if already exists it will update the message.
     * @method _displaySuccessAlert <private> [Function]
     * @param {String} message - the message to display.
     */
    _displaySuccessAlert : function _displaySuccessAlert(message) {
      App.scrollTo(0, 0);

      if (this._successAlert) {
        return this._successAlert.update({
          type: 'positive',
          text: message
        }).shake();
      }

      this.appendChild(new CV.Alert({
        name: '_successAlert',
        type: 'positive',
        text: message,
        className: '-mb1'
      })).render(this.el, this.el.firstElementChild);
    },

    /* Displays an error alert, if already exists it will update the message.
     * @method _displayErrorAlert <private> [Function]
     * @param {String} message - the message to display.
     */
    _displayErrorAlert: function _displayErrorAlert(message) {
      App.scrollTo(0, 0);

      if (this._errorAlert) {
        return this._errorAlert.update({
          type: 'negative',
          text: message
        }).shake();
      }

      this.appendChild(new CV.Alert({
        name: '_errorAlert',
        type: 'negative',
        text: message,
        className: '-mb1'
      })).render(this.el, this.el.firstElementChild);
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      Events.off(this.saveButton.el, 'click', this._saveButtonClickHandlerRef);
      this._saveButtonClickHandlerRef = null;
      return null;
    }
  }
});

