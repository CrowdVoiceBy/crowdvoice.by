var Person = require('./../../lib/currentPerson')
  , API = require('./../../lib/api')
  , constants = require('./../../lib/constants')
  , Events = require('./../../lib/events')
  , Checkit = require('checkit');

Class(CV, 'VoiceEdit').inherits(CV.VoiceBase)({
  MIN_POST_REQUIRED_TO_PUBLISH: 20,
  prototype: {
    isAdmin: null,

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

      this._setup()._updateInfoRow()._bindEvents();
      this.checkit = new Checkit(this.checkitProps);

      this._fillForm(this.data.voiceEntity);
    },

    /* Create and append the form element widgets.
     * @private
     */
    _setup: function _setup() {
      this.appendChild(new CV.UI.Checkbox({
        name: 'checkAnon',
        className: '-pt1 -pb1',
        data: {label : 'Create Anonymously' }
      })).render(this.sendElement);
      this.checkAnon.el.style.display = 'none';

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
            maxlength: this.MAX_TITLE_LENGTH
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
        },
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
          label: 'Twitter hashtags',
          hint: '<i>Use hashtags or <span class="twitter-help-bubble">search operators (?)</span>, content fetched this way will be sent to the moderator board.</i>',
          inputClassName: '-lg -block',
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
        data: {value: 'Update Voice'}
      })).render(this.sendElement);

      return this;
    },

    /* Checks if currentPerson has owned organization in which case an ownership
     * dropdown is added to the form.
     * @private
     */
    _updateInfoRow: function _updateInfoRow() {
      var row = this.el.querySelector('[data-row-voice-info]')
        , owncol = document.createElement('div');

      if (this.data.voiceEntity.owner.isAnonymous) {
        this.appendChild(new CV.UI.DropdownVoiceOwnership({
          name: 'voiceOwnershipDropdown',
          ownerEntity: this.data.voiceEntity.owner
        })).render(owncol);

        this.voiceOwnershipDropdown.selectByEntity(this.data.ownerEntity).disable();
        row.appendChild(owncol);
      } else if ((this.data.ownerEntity.isAnonymous === false) && this.data.ownerEntity.ownedOrganizations) {
        this.appendChild(new CV.UI.DropdownVoiceOwnership({
          name: 'voiceOwnershipDropdown',
          ownerEntity: this.data.ownerEntity
        })).render(owncol);

        this.voiceOwnershipDropdown.selectByEntity(this.data.ownerEntity);
        row.appendChild(owncol);

        this.checkitProps.ownershipDropdown = 'required';
      } else {
        this.appendChild(new CV.UI.DropdownVoiceOwnership({
          name: 'voiceOwnershipDropdown',
          ownerEntity: this.data.voiceEntity.owner
        })).render(owncol);

        this.voiceOwnershipDropdown.selectByEntity(this.data.voiceEntity).disable();
        row.appendChild(owncol);
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

      this._sanitezeSlugRef = this._sanitizeSlugHandler.bind(this);
      Events.on(this.voiceSlug.getInput(), 'keyup', this._sanitezeSlugRef);
      this._lastFreeSlug = this.voiceSlug.getValue();

      return this;
    },

    /* Fills the form using this.data values (Edit Voice).
     * Whem this.data prop is passed (truthy) it should contain the voice
     * entity data to be edited.
     * @private
     */
    _fillForm: function _fillForm(voice) {
      if (voice.images.card) {
        this.voiceImage.setImage(voice.images.card.url);
      }
      this.voiceTitle.setValue(voice.title);
      this.voiceSlug.setValue(voice.slug);
      this.voiceDescription.setValue(this.format.truncate(voice.description, this.MAX_DESCRIPTION_LENGTH));
      this.voiceTopicsDropdown.selectValues(voice.topics.map(function(topic) {
        return topic.id;
      }));
      this.voiceTypesDropdown.selectByValue(voice.type);

      if (this.voiceOwnershipDropdown) {
        this.voiceOwnershipDropdown.selectByEntity(voice.owner);
      }

      this.voiceHashtags.setValue(voice.twitterSearch);
      this.voiceLocation.setValue(voice.locationName);
      this.voiceLatitude.setValue(voice.latitude);
      this.voiceLongitude.setValue(voice.longitude);

      if (voice.owner.isAnonymous) {
        this.checkAnon.check();
      }

      this._appendStatusOptions();
    },

    /* Checks if the `status` options can be shown.
     * @private
     */
    _appendStatusOptions: function _appendStatusOptions() {
      if (this._canBePublished() === false) {
        return this.el.insertAdjacentHTML('beforeend', '\
            <p class="form-create-voice__bottom-help-text -mt2 -text-center">\
            To be able to publish the voice and share it, you need to add at least 20 posts and a cover image.\
            </p>');
      }

      this.appendChild(new CV.VoiceStatusOptions({
        name: 'voiceStatus'
      })).render(this.el, this.sendElement);
      this.voiceStatus.selectByValue(this.data.voiceEntity.status);
    },

    /* Checks if the voice fullfil the minimum requirements to be published:
     * - the voice has a cover image
     * - the voice has at least 20 posts
     * @private
     */
    _canBePublished: function _canBePublished() {
      var hasImage = (this.voiceImage.isEmpty() === false)
        , hasEnoughPosts = (this.data.voiceEntity.postsCount >= this.constructor.MIN_POST_REQUIRED_TO_PUBLISH);
      return (hasImage && hasEnoughPosts);
    },

    _sendFormHandler: function _sendFormHandler() {
      var validate = this.checkit.validateSync(this._getCurrentData());

      if (validate[0]) {
        return this._displayErrors(validate[0].errors);
      }

      this._setSendingState();

      if (this.isAdmin) {
        return API.adminUpdateVoice({
          voiceData: this.data.voiceEntity,
          data: this._dataPresenter()
        }, function(err, res) {
          if (err) {
            this._setErrorState(res.status + ': ' + res.statusText);
            return;
          }
          this._setAdminSuccessState(res);
        }.bind(this));
      }

      var profileName;

      if (this.data.voiceEntity.owner.isAnonymous) {
        profileName = 'anonymous';
      } else {
        profileName = this.data.voiceEntity.owner.profileName;
      }

      return API.voiceEdit({
        profileName: profileName,
        voiceSlug: this.data.voiceEntity.slug,
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
      var message = "“" + res.title + '” was updated! You will be redirected to your voices in a couple of seconds.'
        , url = '/' + Person.get('profileName') + '/myvoices/';

      switch(res.status) {
        case constants.VOICE.STATUS_ARCHIVED: url += '#archived'; break;
        case constants.VOICE.STATUS_DRAFT: url += '#drafts'; break;
        case constants.VOICE.STATUS_PUBLISHED: url += '#published'; break;
        case constants.VOICE.STATUS_UNLISTED: url += '#unlisted'; break;
      }

      window.setTimeout(function() {
        window.location = url;

        if ((window.location.pathname + window.location.hash) === url) {
          window.location.reload();
        }
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

    _setAdminSuccessState: function _setAdminSuccessState() {
      if (this._flashMessage) {
        this._flashMessage.update({
          text: "Voice edited succesfully, redirecting to voices list.",
          type: 'positive'
        }).shake();
      } else {
        this.appendChild(new CV.Alert({
          name: '_flashMessage',
          type: 'positive',
          text: "Voice edited succesfully, redirecting to voices list.",
          className: '-mb1'
        })).render(this.el, this.el.firstElementChild);
      }

      window.setTimeout(function() {
        window.location = '/admin/voices';
      }, this.constructor.REDIRECT_DELAY);
    },

    _getCurrentData: function _getCurrentData() {
      var body = CV.VoiceBase.prototype._getCurrentData.call(this);
      if (this.voiceStatus) {
        body.status = (this.voiceStatus.getValue() || this.data.voiceEntity.status);
      } else {
        body.status = this.data.voiceEntity.status;
      }
      return body;
    },

    /* Returns the data to be sent to server to update current voice.
     * @private, override
     */
    _dataPresenter: function _dataPresenter() {
      var data = CV.VoiceBase.prototype._dataPresenter.call(this);

      if (this.data.voiceEntity.owner.isAnonymous) {
        data.append('anonymously', true);
      } else {
        data.append('anonymously', this.checkAnon.isChecked());
      }

      if (this.voiceOwnershipDropdown) {
        data.append('ownerId', this.voiceOwnershipDropdown.getValue());
      } else {
        data.append('ownerId', this.data.ownerEntity.id);
      }

      if (this.voiceStatus) {
        data.append('status', this.voiceStatus.getValue());
      }

      return data;
    },

    destroy: function destroy() {
      Events.off(this.buttonSend.el, 'click', this._sendFormHandlerRef);
      this._sendFormHandlerRef = null;

      Events.off(this.voiceSlug.getInput(), 'keyup', this._sanitezeSlugRef);
      this._sanitezeSlugRef = null;

      Widget.prototype.destroy.call(this);

      return null;
    }
  }
});
