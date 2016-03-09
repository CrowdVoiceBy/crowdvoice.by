var Person = require('./../../lib/currentPerson')
  , Slug = require('slug')
  , API = require('./../../lib/api');

Slug.defaults.modes.pretty.lower = true;

Class(CV, 'VoiceBase').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'cv-form-create-voice -clearfix',
  HTML: '\
    <div>\
      <div class="-row">\
        <div data-background class="-col-3 -pr1"></div>\
        <div class="-col-9">\
          <div class="-col-12">\
            <div data-title class="-col-6"></div>\
            <div data-slug class="-col-6 -pl1"></div>\
          </div>\
          <div class="-col-12">\
            <div data-description></div>\
          </div>\
        </div>\
      </div>\
      <div data-row-voice-info class="-row">\
        <div data-topics></div>\
        <div data-type></div>\
      </div>\
      <div class="-row">\
        <div data-twitter class="-col-12"></div>\
        <div data-rss class="-col-6 -pl1"></div>\
      </div>\
      <div data-location-wrapper class="-row -rel">\
        <div data-location class="-col-4"></div>\
        <div data-latitude class="-col-4 -pl1"></div>\
        <div data-longitude class="-col-4 -pl1"></div>\
      </div>\
      <div class="send -row -text-center"></div>\
    </div>',

  REDIRECT_DELAY: 2000,

  prototype: {
    MAX_TITLE_LENGTH: 65,
    MAX_DESCRIPTION_LENGTH: 180,
    _flashMessage: null,
    _lastFreeSlug: null,

    /* voiceSlug input keyup handler.
     * Validates that only alpa-numeric values and dashes can be entered on
     * the voiceSlug input manually.
     * @protected
     */
    _sanitizeSlugHandler: function _sanitizeSlugHandler() {
      var slug = this.voiceSlug.getValue();

      if (slug !== this._lastFreeSlug) {
        slug = Slug(slug);
        this._lastFreeSlug = slug;
        this.voiceSlug.setValue(slug);
        this._checkSlugAvailability(slug);
      }
    },

    /* Calls the API isSlugAvailable endpoint to validate if the current
     * slug is available or taken.
     * @protected
     */
    _checkSlugAvailability: function _checkSlugAvailability(slug) {
      this.voiceSlug.clearState().updateHint();

      if (!slug.length) return;

      API.isSlugAvailable({
        profileName: Person.get().profileName,
        slug: slug,
        voiceSlug: (this.data.voiceEntity && this.data.voiceEntity.slug)
      }, this._slugAvailabilityHandler.bind(this));
    },

    /* API's isSlugAvailable response handler
     * @protected
     */
    _slugAvailabilityHandler: function _slugAvailabilityHandler(err, res) {
      if (err) return;

      if (res.status === "taken") {
        this.voiceSlug.clearState().error();
        return this.voiceSlug.updateHint({
          hint : '(slug is already taken)',
          className : '-color-negative'
        });
      }

      this.voiceSlug.clearState().success();
    },

    /* Listens to detectLocation widget 'location' custom event.
     * Updates the latitude and longitude with the response and calls the
     * getGeocoding method on it.
     * @protected
     */
    _getLocationHandler: function _getLocationHandler(ev) {
      this.voiceLatitude.setValue(ev.data.coords.latitude);
      this.voiceLongitude.setValue(ev.data.coords.longitude);
      this.detectLocation.getGeocoding(ev.data.coords.latitude, ev.data.coords.longitude, this._getGeocoding.bind(this));
    },

    /* detectLocation.getGeocoding method callback
     * Updates the locationName input field
     * @protected
     */
    _getGeocoding: function _getGeocoding(err, res) {
      if (err || !res[0]) return;

      var r = res[0]
        , address = [];

      r.address_components.forEach(function(c) {
        if ((c.types[0] === "locality") ||
            (c.types[0] === "administrative_area_level_1") ||
            (c.types[0] === "country")) {
          address.push(c.long_name);
        }
      });

      this.voiceLocation.setValue(address.join(', ') + '.');
      this.voiceLatitude.setValue(r.geometry.location.lat());
      this.voiceLongitude.setValue(r.geometry.location.lng());
    },

    /* Display the current form errors.
     * @protected
     */
    _displayErrors: function _displayErrors(errors) {
      Object.keys(errors).forEach(function(propertyName) {
        var widget = 'voice' + this.format.capitalizeFirstLetter(propertyName);
        this[widget].error();
      }, this);

      if (this.voiceImage.hasError()) {
        var message = 'Please upload a cover image to your voice, this will be the face of your voice.';

        if (this._flashMessage) {
          return this._flashMessage.update({
            text: message,
            type: 'warning'
          }).shake();
        }

        this.appendChild(new CV.Alert({
          name: '_flashMessage',
          type: 'warning',
          text: message,
          className: '-mb1'
        })).render(this.el, this.el.firstElementChild);
      }
    },

    /* Sets the error state of the form.
     * @protected
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

    /* Returns the data to be validated using Checkit module
     * @protected
     */
    _getCurrentData: function _getCurrentData() {
      var body = {
        title: this.voiceTitle.getValue().trim(),
        image: this.voiceImage.getFile(),
        slug: this.voiceSlug.getValue().trim(),
        description: this.voiceDescription.getValue().trim(),
        topicsDropdown: this.voiceTopicsDropdown.getSelection(),
        typesDropdown: this.voiceTypesDropdown.getValue()
      };

      if (this.voiceOwnershipDropdown) {
        body.ownershipDropdown = this.voiceOwnershipDropdown.getValue();
      }

      return body;
    },

    /* Sending state, disable the send button.
     * @protected
     */
    _setSendingState : function _setSendingState() {
      this.buttonSend.disable();
      return this;
    },

    /* Returns the data to be sent to server to update current voice.
     * @protected
     */
    _dataPresenter: function _dataPresenter() {
      var data = new FormData();

      data.append('image', this.voiceImage.getFile());
      data.append('title', this.voiceTitle.getValue().trim());
      data.append('slug', this.voiceSlug.getValue().trim());
      data.append('description', this.voiceDescription.getValue().trim());
      data.append('topics', this.voiceTopicsDropdown.getSelection().map(function(topic) {return topic.id;}));
      data.append('type', this.voiceTypesDropdown.getValue());
      data.append('twitterSearch', this.voiceHashtags.getValue().trim());
      data.append('locationName', this.voiceLocation.getValue().trim());
      data.append('latitude', this.voiceLatitude.getValue().trim());
      data.append('longitude', this.voiceLongitude.getValue().trim());

      return data;
    },

  }
});
