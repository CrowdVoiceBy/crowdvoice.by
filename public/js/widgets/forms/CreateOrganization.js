var Person = require('./../../lib/currentPerson');
var API = require('./../../lib/api');
var Events = require('./../../lib/events');
var Checkit = require('checkit');

Class(CV, 'CreateOrganization').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'cv-form-create-organization',
    HTML : '\
        <div>\
            <div class="-col-12 placeholder-main"></div>\
            <div class="-col-12">\
                <div data-location class="-col-8"></div>\
                <div data-detect class="-col-4 -pl1"></div>\
            </div>\
            <div class="-col-3 -pr1 placeholder-logo"></div>\
            <div class="-col-9 -pl1 placeholder-background"></div>\
            <div class="-col-12 placeholder-send"></div>\
        </div>\
    ',

    prototype : {
        MAX_TITLE_LENGTH : 65,
        MAX_DESCRIPTION_LENGTH : 140,

        _flashMessage : null,

        init : function(config){
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            this.checkitProps = new Checkit({
                name : ['required', 'maxLength:' + this.MAX_TITLE_LENGTH],
                handler : ['required', 'alphaDash'],
                description : ['required', 'maxLength:' + this.MAX_DESCRIPTION_LENGTH]
            });

            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.appendChild(new CV.UI.Input({
                name : 'orgName',
                data : {
                    label : 'Organization Name',
                    hint : this.MAX_TITLE_LENGTH + ' characters max',
                    inputClassName : '-lg -block',
                    attr : {
                        type : 'text',
                        maxlength: this.MAX_TITLE_LENGTH,
                        autofocus: true
                    },
                }
            })).render(this.el.querySelector('.placeholder-main'));

            this.appendChild(new CV.UI.Input({
                name : 'orgHandler',
                data : {
                    label : 'Profile Name (Handler)',
                    hint : 'crowdvoice.by/you-profile-name',
                    inputClassName : '-lg -block'
                }
            })).render(this.el.querySelector('.placeholder-main'));

            this.appendChild(new CV.UI.Input({
                name : 'orgDescription',
                data : {
                    isTextArea : true,
                    label : 'Description',
                    hint : this.MAX_DESCRIPTION_LENGTH + ' characters max',
                    inputClassName : '-lg -block',
                    attr : {
                        rows : 2,
                        maxlength: this.MAX_DESCRIPTION_LENGTH
                    }
                }
            })).render(this.el.querySelector('.placeholder-main'));

            this.appendChild(new CV.UI.Input({
                name : 'orgLocation',
                data : {
                    label : "Location",
                    inputClassName : '-lg -block'
                }
            })).render(this.el.querySelector('[data-location]'));

            this.appendChild(new CV.DetectLocation({
                name : 'detectLocation',
                label : 'Use Current Location',
                requireGoogleMaps : true
            })).render(this.el.querySelector('[data-detect]'));

            this.appendChild(new CV.Image({
                name : 'orgLogoImage',
                data: {title : 'Logo / badge'}
            })).render(this.el.querySelector('.placeholder-logo'));

            this.appendChild(new CV.Image({
                name : 'orgBackgroundImage',
                data : {title : 'Background'}
            })).render(this.el.querySelector('.placeholder-background'));

            this.appendChild(new CV.UI.Button({
                name  : 'buttonSend',
                className : 'primary full',
                data : {value : 'Create Organization'}
            })).render(this.el.querySelector('.placeholder-send'));

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._getLocationRef = this._getLocationHandler.bind(this);
            this.detectLocation.bind('location', this._getLocationRef);

            this._validateProfileNameHandlerRef = this._validateProfileNameHandler.bind(this);
            Events.on(this.orgHandler.getInput(), 'keyup', this._validateProfileNameHandlerRef);

            this._sendFormHandlerRef = this._sendFormHandler.bind(this);
            Events.on(this.buttonSend.el, 'click', this._sendFormHandlerRef);
            return this;
        },

        /* Checks if a profileName is available. Uses API's isProfileNameAvailable endpoint.
         * @method _validateProfileNameHandler <private>
         */
        _validateProfileNameHandler : function _validateProfileNameHandler() {
            var value = this.orgHandler.getValue().trim();

            this.orgHandler.clearState().updateHint();

            if (!value) {
                return void 0;
            }

            var validate = this.checkitProps.validateSync({
                handler : value
            });

            if (validate[0] && validate[0].errors.handler) {
                return this.orgHandler.clearState().error().updateHint({
                    hint: validate[0].errors.handler.message,
                    className : '-color-negative'
                });
            }

            API.isProfileNameAvailable({
                profileName : Person.get().profileName,
                value : value
            }, this._profileNameAvailabilityHandler.bind(this));
        },

        /* API's isProfileNameAvailable response handler.
         * @method _profileNameAvailabilityHandler <private>
         */
        _profileNameAvailabilityHandler : function _profileNameAvailabilityHandler(err, res) {
            if (err) {
                return void 0;
            }

            if (res.status === "taken") {
                return this.orgHandler.clearState().error().updateHint({
                    hint : '(profile name already taken)',
                    className : '-color-negative'
                });
            }

            this.orgHandler.clearState().success().updateHint({
                hint : 'crowdvoice.by/' + this.orgHandler.getValue(),
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
                // @TODO: handle error
                console.log(err);
                return void 0;
            }

            if (!res[0]) {
                // @TODO: handle case
                console.log('asjfas');
                return void 0;
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

            this.orgLocation.setValue(address.join(', ') + '.');
        },

        /* Checks if the form should be sent. Otherwise it gets prevented and
         * display the errors feedback.
         * @method _sendFormHandler <private>
         */
        _sendFormHandler : function _sendFormHandler() {
            var validate = this.checkitProps.validateSync({
                name : this.orgName.getValue(),
                handler : this.orgHandler.getValue(),
                description : this.orgDescription.getValue()
            });

            if (validate[0]) {
                return this._displayErrors(validate[0].errors);
            }

            if (this.orgHandler.hasError) {
                return;
            }

            this._setSendingState();

            API.createOrganization({
                data : this._dataPresenter(),
                profileName : Person.get().profileName
            }, this._createOrganizationHandler.bind(this));
        },

        /* CreateOrganization's API method response handler.
         * @method _createOrganizationHandler <private>
         */
        _createOrganizationHandler : function _createOrganizationHandler(err, res) {
            console.log(err);
            console.log(res);

            if (err) {
                this._setErrorState(res.status + ': ' + res.statusText);
                return;
            }

            this._setSuccessState(res);
        },

        /* Display the current form errors.
         * @method _displayErrors
         */
        _displayErrors : function _displayErrors(errors) {
            Object.keys(errors).forEach(function(propertyName) {
                var widget = 'org' + this.format.capitalizeFirstLetter(propertyName);
                this[widget].error();
            }, this);
        },

        /* Sending state, disable the send button.
         * @message _setSendingState <private>
         */
        _setSendingState : function _setSendingState() {
            this.buttonSend.disable();
            return this;
        },

        /* Sets the error state of the form.
         * @method _setErrorState <private>
         */
        _setErrorState : function _setErrorState(message) {
            this.buttonSend.enable();

            if (this._flashMessage) {
                return this._flashMessage.update({
                    type : 'negative',
                    text : message,
                }).shake();
            }

            this.appendChild(new CV.Alert({
                name : '_flashMessage',
                type : 'negative',
                text : message,
                className : '-mb1'
            })).render(this.el, this.el.firstElementChild);
        },

        /* Sets the success state of the form.
         * @method _setSuccessState <private>
         */
        _setSuccessState : function _setSuccessState(res) {
            var message = "Your new organization “" + res.name + '” was created! You will be redirected to its profile in a couple of seconds.';

            if (this._flashMessage) {
                this._flashMessage.update({
                    type : 'positive',
                    text : message,
                }).shake();
            } else {
                this.appendChild(new CV.Alert({
                    name : '_flashMessage',
                    type : 'positive',
                    text : message,
                    className : '-mb1'
                })).render(this.el, this.el.firstElementChild);
            }

            window.setTimeout(function() {
                window.location.replace('/' + res.profileName + '/');
            }, 4000);

            return this;
        },

        _clearForm : function _clearForm() {
            this.orgName.setValue('');
            this.orgHandler.setValue('').clearState().updateHint();
            this.orgDescription.setValue('');
            this.orgLocation.setValue('');
            this.orgLogoImage.reset();
            this.orgBackgroundImage.reset();
            return this;
        },

        /* Returns the data to be sent to server to create a new Organization.
         * @method _dataPresenter <private> [Function]
         */
        _dataPresenter : function _dataPresenter() {
            var data = new FormData();
            data.append('title', this.orgName.getValue().trim());
            data.append('profileName', this.orgHandler.getValue().trim());
            data.append('description', this.orgDescription.getValue().trim());
            data.append('locationName', this.orgLocation.getValue().trim());
            data.append('imageLogo', this.orgLogoImage.getFile());
            data.append('imageBackground', this.orgBackgroundImage.getFile());
            return data;
        },

        destroy : function destroy() {
            Events.off(this.buttonSend.el, 'click', this._sendFormHandlerRef);
            this._sendFormHandlerRef = null;
            Widget.prototype.destroy.call(this);
            return null;
        }
    }
});
