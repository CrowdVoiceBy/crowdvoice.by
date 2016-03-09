var API = require('./../../lib/api');

Class(CV, 'UserProfileVoicesTab').inherits(Widget)({
    HTML : '\
        <div>\
            <h2 class="profile-subheading -font-bold -m0">Voices</h2>\
            <hr>\
            <div data-container class="responsive-width-voice-covers -rel"></div>\
        </div>',

    prototype : {
        _fetching : false,
        _fetched : false,

        /* Holds the ResponsiveWidth instance reference.
         * @property _responsiveWidth <private>
         */
        _responsiveWidth : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.containerElement = this.el.querySelector('[data-container]');

            this.loader = new CV.Loading().render(this.containerElement).center().setStyle({top: '100px'});
        },

        fetch : function fetch() {
            if ((this._fetching === true) || (this._fetched === true)) {
                return;
            }

            this._fetching = true;
            API.getEntityVoices({
                profileName : this.data.entity.profileName,
            }, this._handleFetchResults.bind(this));
        },

        _handleFetchResults : function _handleFetchResults(err, res) {
            this._fetching = false;

            if (err) {
                console.log(err);
                return;
            }

            this._fetched = true;
            this._renderResults(res);
        },

        _renderResults : function _renderResults(voices) {
            var fragment = document.createDocumentFragment();

            this.parent.parent.nav.updateCounter(voices.length);

            if (voices.length) {
                voices.forEach(function(voice, index) {
                    fragment.appendChild(this.appendChild(new CV.VoiceCover({
                        name : 'voice_' + index,
                        data : voice
                    })).el);
                }, this);

                this._responsiveWidth = new CV.ResponsiveWidth({
                    container : this.containerElement,
                    items : this.children.map(function(ch) {return ch.el;}),
                    minWidth : 300
                }).setup();

                this.containerElement.appendChild(fragment);
            } else {
                this.appendChild(new CV.EmptyState({
                    name : 'empty',
                    className : '-pt4 -pb4',
                    message : '@' + this.data.entity.profileName + ' hasn’t created voices yet.'
                })).render(this.containerElement);
            }

            this.loader.disable().remove();
        },

        _activate : function _activate() {
            Widget.prototype._activate.call(this);
            if ((this._fetching === false) && (this._fetched === false)) {
                return this.fetch();
            }

            this._responsiveWidth && this._responsiveWidth.update();
        }
    }
});
