/* globals App */
var API = require('./../../lib/api');
var Person = require('./../../lib/currentPerson');
var Events = require('./../../lib/events');
var Checkit = require('checkit');

Class(CV, 'UserProfileEditTab').inherits(Widget)({
    ELEMENT_CLASS : 'user-profile-edit-tab',

    HTML : '\
        <div>\
            <div class="-row -mb1">\
                <div data-placeholder-images></div>\
            </div>\
            <div class="-row">\
                <div data-placeholder-main></div>\
            </div>\
        </div>',

    MAX_DESCRIPTION_LENGTH : 140,

    prototype : {
        data : {backgroundImage : null},

        _alertSuccess : null,
        _alertError : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.imagesPlaceholder = this.el.querySelector('[data-placeholder-images]');
            this.mainElement = this.el.querySelector('[data-placeholder-main]');

            this.checkitProfile = new Checkit({
                name : 'required',
                profilename : ['required', 'alphaDash']
            });

            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.appendChild(new CV.UploadImage({
                name : 'profileImage',
                className : 'edit-profile__profile-picture -inline-block -mr5',
                data : {
                    title : 'Profile Picture',
                    accept : 'image/*',
                    showRemoveButton : true,
                    buttonWrapperClassName : '-pl1',
                    buttonHint : 'JPG, GIF or PNG'
                }
            })).render(this.imagesPlaceholder);
            if (Person.getImage('card')) {
                this.profileImage.setImage(Person.getImage('card'));
            }

            this.appendChild(new CV.UploadImage({
                name : 'backgroundImage',
                className : 'edit-profile__background-picture -inline-block',
                data: {
                    title : 'Background Picture',
                    accept : 'image/*',
                    showRemoveButton : true,
                    buttonWrapperClassName : '-pl1',
                    buttonHint : 'JPG, GIF or PNG'
                }
            })).render(this.imagesPlaceholder);
            if (this.data.backgroundImage) {
                this.backgroundImage.setImage(this.data.backgroundImage);
            }

            this.appendChild(new CV.UI.Input({
                name : 'nameInput',
                className : 'user-profile-edit-tab__input-name',
                data : {
                    label : 'Your Name',
                    hint : '',
                    attr  : {
                        value : Person.get().name,
                        type: 'text'
                    },
                    inputClassName : '-md -block'
                }
            })).render(this.mainElement);

            this.appendChild(new CV.UI.Input({
                name : 'profilenameInput',
                className : 'user-profile-edit-tab__input-profile-name',
                data : {
                    label : 'Profile Name',
                    hint : '(65 characters max)',
                    attr  : {
                        value : Person.get().profileName,
                        type: 'text',
                        maxLength: 65
                    },
                    inputClassName : '-md -block'
                }
            })).render(this.mainElement);

            this.appendChild(new CV.UI.Input({
                name : 'descriptionInput',
                data : {
                    label : 'Short Bio',
                    hint : '(140 characters max)',
                    inputClassName : '-md -block',
                    isTextArea : true,
                    attr : {
                        rows : 3,
                        maxLength : this.constructor.MAX_DESCRIPTION_LENGTH
                    }
                }
            })).render(this.mainElement).setValue(Person.get().description);

            this.appendChild(new CV.UI.Input({
                name : 'locationInput',
                data : {
                    label : 'Location',
                    hint : '',
                    attr  : {
                        value : (Person.get().location === null ? '' :  Person.get().location),
                        type: 'text'
                    },
                    inputClassName : 'user-profile-edit-tab__input-location -md -inline-block'
                }
            })).render(this.mainElement);

            this.appendChild(new CV.DetectLocation({
                name : 'detectLocation',
                label : 'Use Current Location',
                requireGoogleMaps : true
            })).render(this.locationInput.inputWrapper);

            this.appendChild(new CV.UI.Button({
                name : 'saveButton',
                className : 'positive small',
                data : {value : 'Save Changes'},
            })).render(this.el);

            return this;
        },

        /* Register the widget events.
         * @method _bindEvents <private> [Function]
         * @return UserProfileEditTab
         */
        _bindEvents : function _bindEvents() {
            Events.on(this.profilenameInput.getInput(), 'keyup', this._checkProfileNameAvailability.bind(this));
            this.detectLocation.bind('location', this._getLocationHandler.bind(this));
            Events.on(this.saveButton.el, 'click', this._sendFormHandler.bind(this));
            return this;
        },

        /* Checks if a profileName is available. Uses API's isProfileNameAvailable endpoint.
         * @method _validateProfileNameHandler <private>
         * @return undefined
         */
        _checkProfileNameAvailability : function _checkProfileNameAvailability() {
            var value = this.profilenameInput.getValue();

            this.profilenameInput.clearState().updateHint();

            if (!value) {
                return;
            }

            var validate = this.checkitProfile.validateSync({
                profilename : value
            });

            if (validate[0] && validate[0].errors.profilename) {
                return this.profilenameInput.clearState().error().updateHint({
                    hint: '(' + validate[0].errors.profilename.message + ')',
                    className : '-color-negative'
                });
            }

            API.isProfileNameAvailable({
                profileName : Person.get().profileName,
                value : this.profilenameInput.getValue().trim()
            }, this._profileNameAvailabilityHandler.bind(this));
        },

        /* API's isProfileNameAvailable response handler.
         * @method _profileNameAvailabilityHandler <private>
         */
        _profileNameAvailabilityHandler : function _profileNameAvailabilityHandler(err, res) {
            if (err) {
                return;
            }

            if ((res.status === "taken") &&
                (Person.get('profileName') !== this.profilenameInput.getValue())
               ) {
                return this.profilenameInput.clearState().error().updateHint({
                    hint : '(profile name already taken)',
                    className : '-color-negative'
                });
            }

            this.profilenameInput.clearState().success().updateHint({
                hint : 'crowdvoice.by/' + this.profilenameInput.getValue(),
                className : '-color-positive'
            });
        },

        /* Listens to detectLocation widget 'location' custom event.
         * Updates the latitude and longitude with the response and calls the
         * getGeocoding method on it.
         */
        _getLocationHandler : function _getLocationHandler(ev) {
            this.detectLocation.getGeocoding(ev.data.coords.latitude, ev.data.coords.longitude, this._getGeocoding.bind(this));
        },

        /* detectLocation.getGeocoding method callback
         * Updates the locationName input field
         * @method _getGeocoding <private>
         */
        _getGeocoding : function _getGeocoding(err, res) {
            if (err) {
                return;
            }

            if (!res[0]) {
                return;
            }

            var r = res[0];
            var address = [];

            r.address_components.forEach(function(c) {
                if (
                    (c.types[0] === "locality") ||
                    (c.types[0] === "administrative_area_level_1") ||
                    (c.types[0] === "country")
                ) {
                    address.push(c.long_name);
                }
            });

            this.locationInput.setValue(address.join(', ') + '.');
        },

        /* Checks if the form should be sent. Otherwise it gets prevented and
         * display the errors feedback.
         * @method _sendFormHandler <private>
         */
        _sendFormHandler : function _sendFormHandler() {
            var validate = this.checkitProfile.validateSync({
                name: this.nameInput.getValue().trim(),
                profilename: this.profilenameInput.getValue().trim()
            });

            this.saveButton.disable();

            if (validate[0]) {
                this.saveButton.enable();
                this._displayFormErrors(validate[0].errors);
                return;
            }

            if (this.profilenameInput.hasError) {
                return;
            }

            API.updateEntity({
                profileName : Person.get().profileName,
                data : this._getDataPresenter(),
            }, function(err, res) {
                if (err) {
                    this.saveButton.enable();
                    return this._displayErrorAlert('There was an error while updating your profile - (' + res.status + ')');
                }

                if (res.status === 'error') {
                    var erroredKeys = Object.keys(res.errors).map(function(key) {
                        return key;
                    }).join(',' );

                    this.saveButton.enable();
                    return this._displayErrorAlert('There was an error while updating your profile - (' + erroredKeys + ')');
                }

                this.saveButton.enable();
                this.nameInput.clearState().updateHint();
                this.profilenameInput.clearState().updateHint();

                if (res.status === 'success') {
                    var url = '/' + this.profilenameInput.getValue() + '/edit/#profile';
                    this._displaySuccessAlert('Your profile has been updated.');
                    setTimeout(function() {
                      window.location.replace(url);
                    }, 1000);
                }
            }.bind(this));
        },

        /* Display the current form errors.
         * @method _displayFormErrors
         */
        _displayFormErrors : function _displayFormErrors(errors) {
            Object.keys(errors).forEach(function(propertyName) {
                this[propertyName + 'Input'].error().updateHint({
                    hint : '(' + errors[propertyName].message + ')',
                    className : '-color-negative'
                });
            }, this);
        },

        /* Displays a success alert, if already exists it will update the message.
         * @method _displaySuccessAlert <private> [Function]
         * @argument message <required> [String] the message to display.
         * @return undefined
         */
        _displaySuccessAlert : function _displaySuccessAlert(message) {
            App.scrollTo(0, 0);

            if (this._alertSuccess) {
                return this._alertSuccess.update({
                    type : 'positive',
                    text: message
                }).shake();
            }

            this.appendChild(new CV.Alert({
                name : '_alertSuccess',
                type : 'positive',
                text : message,
                className : '-mb1'
            })).render(this.el, this.el.firstElementChild);
        },

        /* Displays an error alert, if already exists it will update the message.
         * @method _displayErrorAlert <private> [Function]
         * @argument message <required> [String] the message to display.
         * @return undefined
         */
        _displayErrorAlert : function _displayErrorAlert(message) {
            App.scrollTo(0, 0);

            if (this._alertError) {
                return this._alertError.update({
                    type : 'negative',
                    text: message
                }).shake();
            }

            this.appendChild(new CV.Alert({
                name : '_alertError',
                type : 'negative',
                text : message,
                className : '-mb1'
            })).render(this.el, this.el.firstElementChild);
        },

        /* Returns the data to be sent to server to create a new Organization.
         * @method _getDataPresenter <private> [Function]
         * @return data [FormData]
         */
        _getDataPresenter : function _getDataPresenter() {
            var data = new FormData();

            data.append('name', this.nameInput.getValue().trim());
            data.append('profileName', this.profilenameInput.getValue().trim());
            data.append('description', this.descriptionInput.getValue().trim());
            data.append('location', this.locationInput.getValue().trim());

            if (this.profileImage.imageRemoved || this.profileImage.getFile()) {
                data.append('image', this.profileImage.getFile());
            }

            if (this.backgroundImage.imageRemoved || this.backgroundImage.getFile()) {
                data.append('background', this.backgroundImage.getFile());
            }

            return data;
        }
    }
});
