/* Widget to help get the current user position coordinates using the geolocation API.
 *
 * It can also do Geocoding using the GoogleMaps API. For this you need to pass a prop `requireGoogleMaps` as true,
 * this will check if the google api is alredy loaded and ready to use, otherwise it will injected automatically
 * and handle the needed flow for it to work.
 *
 * @usage Simple get coordinates
 *      this.appendChild(new CV.DetectLocation({
 *          name : 'detectLocation',
 *      })).render(...);
 *
 *      this.detectLocation.bind('location', fn(ev) => console.log(ev.data)) // the coords info
 *
 * @usage Get coords and/or Geocoding
 *      this.appendChild(new CV.DetectLocation({
 *          name : 'detectLocation',
 *          requireGoogleMaps : true
 *      })).render(...);
 *
 *      this.detectLocation.bind('location', fn(ev) =>
 *          this.detectLocation.getGeocoding(ev.data.coords.latitude, ev.data.coords.longitud, fn(err, res) {...});
 */

/* globals google */
var Events = require('./../../lib/events');

Class(CV, 'DetectLocation').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'cv-detect-location -inline-block',
    HTML : '\
        <div>\
            <a href="#" class="cv-detect-location__anchor -inline-block">\
                <svg class="cv-detect-location__icon -s14">\
                    <use xlink:href="#svg-location"></use>\
                </svg>\
                <span class="cv-detect-location__label">Detect</span>\
            </a>\
        </div>',

    addGoogleMapsScript : function addGoogleMapsScript(callback) {
        (function(d, s, id){
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)){ return; }
            js = d.createElement(s); js.id = id;
            js.src = "https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&callback=" + callback;
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'cv-google-maps-script'));
    },

    googleMapsInjectedCallback : function googleMapsInjectedCallback() {
        this.dispatch('googleMapsScriptInjected');
    },

    prototype : {
        label : 'Detect',
        requireGoogleMaps : false,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.anchorElement = this.el.querySelector('.cv-detect-location__anchor');

            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.dom.updateText(this.el.querySelector('.cv-detect-location__label'), this.label);

            if (this.requireGoogleMaps && (typeof google === 'undefined')) {
                this.disable();
                CV.DetectLocation.addGoogleMapsScript('CV.DetectLocation.googleMapsInjectedCallback');
                return this;
            }

            this._googleMapsLoaded();
            return this;
        },

        _googleMapsLoaded : function _googleMapsLoaded() {
            this.geocoder = new google.maps.Geocoder();
            this.enable();
        },

        _bindEvents : function _bindEvents() {
            this.constructor.bind('googleMapsScriptInjected', this._googleMapsLoaded.bind(this));
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.anchorElement, 'click', this._clickHandlerRef);
        },

        _clickHandler : function _clickHandler(ev) {
            ev.preventDefault();

            if (this.disabled) {
                return false;
            }

            this.el.classList.add('looking');

            navigator.geolocation.getCurrentPosition(function(geoposition) {
                this.el.classList.remove('looking');
                this.dispatch('location', {data: geoposition});
            }.bind(this));

            return false;
        },

        getGeocoding : function getGeocoding(latitude, longitude, callback) {
            var latlng = new google.maps.LatLng(latitude, longitude);

            this.geocoder.geocode({'latLng': latlng}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                    callback(null, results);
                } else {
                    callback(true, "Geocoder failed due to: " + status);
                }
            });
        }
    }
});
