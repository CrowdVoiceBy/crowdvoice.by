var Person = require('./../../lib/currentPerson')
  , API = require('./../../lib/api')
  , constants = require('./../../lib/constants')
  , Events = require('./../../lib/events')
  , Checkit = require('checkit')
  , Slug = require('slug');

Class(CV, 'VoiceCreate').inherits(CV.VoiceBase)({
  prototype : {
    _autoGenerateSlug: true,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.sendElement = this.el.querySelector('.send');

      this.checkitProps = {
        title: ['required', 'maxLength:' + this.MAX_TITLE_LENGTH],
        slug: ['required', 'alphaDash', 'maxLength:' + this.MAX_TITLE_LENGTH],
        description: ['required', 'maxLength:' + this.MAX_DESCRIPTION_LENGTH],
        topicsDropdown: ['array', 'minLength:1'],
        typesDropdown: 'required',
        status: 'required'
      };

      this._setup()._updateInfoRow();

      this._bindEvents();
      this.checkit = new Checkit(this.checkitProps);
    },

    /* Create and append the form element widgets.
     * @private
     */
    _setup: function _setup() {
      if (Person.anon()) {
        this.appendChild(new CV.Alert({
          name: '_flashMessage',
          type: 'warning',
          text: 'You are creating this Voice anonymously. If you wish to make it public then turn Anonymous Mode off.',
          className: '-mb2'
        })).render(this.el, this.el.firstChild);
      } else {
        this.appendChild(new CV.UI.Checkbox({
          name: 'checkAnon',
          className: '-pt1 -pb1',
          data: {label: 'Create Anonymously' }
        })).render(this.sendElement);
      }

      this.appendChild(new CV.Image({
        name: 'voiceImage',
        data: {title: "Cover image"}
      })).render(this.el.querySelector('[data-background]'));

      this.appendChild(new CV.UI.Input({
        name: 'voiceTitle',
        data: {
          label: 'Title',
          hint: this.MAX_TITLE_LENGTH + ' characters max',
          attr: {
            type: 'text',
            maxlength: this.MAX_TITLE_LENGTH,
            autofocus: true
          },
          inputClassName: '-lg -block'
        }
      })).render(this.el.querySelector('[data-title]'));

      this.appendChild(new CV.UI.Input({
        name: 'voiceSlug',
        data: {
          label: 'Slug',
          hint: this.MAX_TITLE_LENGTH + ' characters max',
          attr: {
            type: 'text',
            maxlength: this.MAX_TITLE_LENGTH
          },
          inputClassName: '-lg -block'
        }
      })).render(this.el.querySelector('[data-slug]'));

      this.appendChild(new CV.UI.Input({
        name: 'voiceDescription',
        data: {
          isTextArea: true,
          label: 'Description',
          hint: '140 characters max',
          inputClassName: '-lg -block',
          attr: {
            rows: 2,
            maxlength: this.MAX_DESCRIPTION_LENGTH
          }
        }
      })).render(this.el.querySelector('[data-description]'));

      this.appendChild(new CV.UI.DropdownTopics({
        name: 'voiceTopicsDropdown'
      })).render(this.el.querySelector('[data-topics]'));

      this.appendChild(new CV.UI.DropdownVoiceTypes({
        name: 'voiceTypesDropdown'
      })).render(this.el.querySelector('[data-type]'));

      this.appendChild(new CV.UI.Input({
        name: 'voiceHashtags',
        data: {
          label: "Twitter hashtags",
          inputClassName: '-lg -block',
          hint: '<i>Use hashtags or <span class="twitter-help-bubble">search operators (?)</span>, content fetched this way will be sent to the moderator board.</i>',
        }
      })).render(this.el.querySelector('[data-twitter]'));

      this.appendChild(new CV.PopoverBlocker({
        name: 'popoverTwitterHelp',
        className: 'twitter-help-popover',
        placement: 'right',
        title: 'Refine your twitter search with operators',
        content: new CV.PopoverTwitterHelp({
          name: 'popoverTwitterHelpContent'
        }).el
      })).render(this.voiceHashtags.el.querySelector('.twitter-help-bubble'));

      // this.appendChild(new CV.UI.Input({
      //     name : 'voiceRssfeed',
      //     data : {
      //         label : 'Content from rss feed',
      //         inputClassName : '-lg -block'
      //     }
      // })).render(this.el.querySelector('[data-rss]'));

      this.appendChild(new CV.DetectLocation({
        name: 'detectLocation',
        label: 'Use Current Location',
        requireGoogleMaps: true
      })).render(this.el.querySelector('[data-location-wrapper]'));

      this.appendChild(new CV.UI.Input({
        name: 'voiceLocation',
        data: {
          label: 'Location Name',
          inputClassName: '-lg -block',
          attr: {
            placeholder: 'Location name'
          }
        }
      })).render(this.el.querySelector('[data-location]'));

      this.appendChild(new CV.UI.Input({
        name: 'voiceLatitude',
        data: {
          label: 'Latitude',
          inputClassName: '-lg -block',
          attr: {
            placeholder: 'Latitude'
          }
        }
      })).render(this.el.querySelector('[data-latitude]'));

      this.appendChild(new CV.UI.Input({
        name: 'voiceLongitude',
        data: {
          label: 'Longitude',
          inputClassName: '-lg -block',
          attr: {
            placeholder: 'Longitude'
          }
        }
      })).render(this.el.querySelector('[data-longitude]'));

      this.appendChild(new CV.UI.Button({
        name: 'buttonSend',
        className: 'primary full',
        data: {value: 'Create Voice'}
      })).render(this.sendElement);

      this.el.insertAdjacentHTML('beforeend', '\
        <p class="form-create-voice__bottom-help-text -mt2 -text-center">\
        Voice will be created as a <b>Draft</b>. To be able to publish the voice and share it, you need to add at least 20 posts and a cover image.\
        </p>');

      return this;
    },

    /* Checks if currentPerson has owned organization in which case an ownership
     * dropdown is added to the form.
     * @private
     */
    _updateInfoRow: function _updateInfoRow() {
      var row = this.el.querySelector('[data-row-voice-info]')
        , owncol = document.createElement('div');

      if ((this.data.ownerEntity.isAnonymous === false) && this.data.ownerEntity.ownedOrganizations) {
        this.appendChild(new CV.UI.DropdownVoiceOwnership({
          name: 'voiceOwnershipDropdown',
          ownerEntity: this.data.ownerEntity
        })).render(owncol);

        this._ownershipChangedHandlerRef = this._ownershipChangedHandler.bind(this);
        this.voiceOwnershipDropdown.bind('ownership:changed', this._ownershipChangedHandlerRef);

        this.voiceOwnershipDropdown.selectByEntity(this.data.ownerEntity);
        row.appendChild(owncol);

        this.checkitProps.ownershipDropdown = 'required';
      }

      var l = 12/row.childElementCount;
      [].slice.call(row.children).forEach(function(col, index) {
        var classSelectors = ['-col-' + l];
        if (index >= 1) {
          classSelectors.push('-pl1');
        }
        this.dom.addClass(col, classSelectors);
      }, this);
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._getLocationRef = this._getLocationHandler.bind(this);
      this.detectLocation.bind('location', this._getLocationRef);

      this._sendFormHandlerRef = this._sendFormHandler.bind(this);
      Events.on(this.buttonSend.el, 'click', this._sendFormHandlerRef);

      if (this._autoGenerateSlug) {
        this._generateSlughandlerRef = this._generateSlugHandler.bind(this);
        Events.on(this.voiceTitle.getInput(), 'keyup', this._generateSlughandlerRef);
      }

      this._letFreeSlugRef = this._letFreeSlug.bind(this);
      Events.on(this.voiceSlug.getInput(), 'keyup', this._letFreeSlugRef);

      return this;
    },

    /* @private
     */
    _ownershipChangedHandler: function _ownershipChangedHandler(ev) {
      ev.stopPropagation();

      if (ev.data.dataset.isOrganization === "true") {
        if (this.checkAnon.isChecked()) {
          var message = 'You cannot create voices anonymously as an organization.';

          this.checkAnon.uncheck();

          if (this._flashMessage) {
            this._flashMessage.update({
              text: message,
              type: 'warning'
            }).shake();
          } else {
            this.appendChild(new CV.Alert({
              name: '_flashMessage',
              type: 'warning',
              text: message,
              className: '-mb1'
            })).render(this.el, this.el.firstElementChild);
          }
        }

        this.checkAnon.disable();
      } else {
        this.checkAnon.enable();
      }
    },

    /* Watch the voiceTitle input change event, auto-generates a valid slug
     * and updates the voiceSlug input with the genereted slug string
     * @private
     */
    _generateSlugHandler: function _generateSlugHandler() {
      var slug = Slug(this.voiceTitle.getValue());
      this.voiceSlug.setValue(slug);
      this._checkSlugAvailability(slug);
    },

    /* When the user changes the voiceSlug input value manually we have to
     * stop `watching` the voiceTitle input change event, so we do not auto
     * generate the slug anymore but let the user enter whatever slug she
     * wants.
     * This method checks if we should stop watching the title input.
     * @private
     */
    _letFreeSlug: function _letFreeSlug() {
      if (Slug(this.voiceTitle.getValue()) !== this.voiceSlug.getValue()) {
        this._autoGenerateSlug = false;

        Events.off(this.voiceTitle.getInput(), 'keyup', this._generateSlughandlerRef);
        this._generateSlughandlerRef = null;

        Events.off(this.voiceSlug.getInput(), 'keyup', this._letFreeSlugRef);
        this._letFreeSlugRef = this._sanitizeSlugHandler.bind(this);
        Events.on(this.voiceSlug.getInput(), 'keyup', this._letFreeSlugRef);
        this._lastFreeSlug = this.voiceSlug.getValue();
      }
    },

    _sendFormHandler: function _sendFormHandler() {
      var validate = this.checkit.validateSync(this._getCurrentData());
      if (validate[0]) return this._displayErrors(validate[0].errors);

      this._setSendingState();

      API.voiceCreate({
        data: this._dataPresenter()
      }, function (err, res) {
        if (err) return this._setErrorState(res.status + ': ' + res.statusText);
        this._setSuccessState(res);
      }.bind(this));
    },

    /* Sets the success state of the form.
     * @private
     */
    _setSuccessState: function _setSuccessState(res) {
      var message = "“" + res.title + '” was created! You will be redirected to its profile in a couple of seconds.';

      window.setTimeout(function() {
        window.location.replace('/' + res.owner.profileName + '/' + res.slug + '/');
      }, this.constructor.REDIRECT_DELAY);

      if (this._flashMessage) {
        this._flashMessage.update({
          type: 'positive',
          text: message
        }).shake();
        return this;
      }

      this.appendChild(new CV.Alert({
        name: '_flashMessage',
        type: 'positive',
        text: message,
        className: '-mb1'
      })).render(this.el, this.el.firstElementChild);

      return this;
    },

    /* Returns the data to be validated using Checkit module
     * @protected
     */
    _getCurrentData: function _getCurrentData() {
      var body = CV.VoiceBase.prototype._getCurrentData.call(this);
      body.status = constants.VOICE.STATUS_DRAFT;
      return body;
    },

    /* Returns the data to be sent to server to create a new Voice.
     * @private, override
     */
    _dataPresenter: function _dataPresenter() {
      var data = CV.VoiceBase.prototype._dataPresenter.call(this);

      if (Person.anon()) {
        data.append('anonymously', true);
      } else {
        data.append('anonymously', this.checkAnon.isChecked());
      }

      if (this.voiceOwnershipDropdown) {
        data.append('ownerId', this.voiceOwnershipDropdown.getValue());
      } else {
        data.append('ownerId', Person.get().id);
      }

      data.append('status', constants.VOICE.STATUS_DRAFT);

      return data;
    },

    destroy: function destroy() {
      Events.off(this.buttonSend.el, 'click', this._sendFormHandlerRef);
      this._sendFormHandlerRef = null;

      if (this._autoGenerateSlug) {
        Events.off(this.voiceTitle.getInput(), 'keyup', this._generateSlughandlerRef);
        this._generateSlughandlerRef = null;

        Events.off(this.voiceSlug.getInput(), 'keyup', this._letFreeSlugRef);
        this._letFreeSlugRef = null;
      }

      Widget.prototype.destroy.call(this);

      return null;
    }
  }
});
