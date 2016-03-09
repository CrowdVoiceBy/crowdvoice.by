var API = require('./../../lib/api');

Class(CV, 'DiscoverTrendingUsersTab').inherits(Widget)({
    ELEMENT_CLASS : 'responsive-width-cards -rel',

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
            this.loader = new CV.Loading().render(this.el).center().setStyle({
                top: '100px'
            });
        },

        /* Fetch /discover/trending/people and call method to render them.
         * @method fetch <public> [Function]
         * @return undefined
         */
        fetch : function fetch() {
            if ((this._fetching === true) || (this._fetched === true)) {
                return;
            }

            this._fetching = true;

            API.getTrendingPeople(this._handleFetchResults.bind(this));
        },

        /* Handle the API getNewVoices endpoint response.
         * @method _handleFetchResults <private> [Function]
         * @return undefined
         */
        _handleFetchResults : function _handleFetchResults(err, res) {
            this._fetching = false;

            if (err) {
                console.log(err);
                return;
            }

            this._fetched = true;

            if (res.length) {
                return this._renderResults(res);
            }

            return this._renderEmptyState();
        },

        /* Render the getNewVoices response VoiceCovers.
         * @method _renderResults <private> [Function]
         * @return undefined
         */
        _renderResults : function _renderResults(voices) {
            var fragment = document.createDocumentFragment();

            voices.forEach(function(voice, index) {
                fragment.appendChild(this.appendChild(new CV.Card({
                    name : 'card_' + index,
                    data : voice
                })).el);
            }, this);

            this._responsiveWidth = new CV.ResponsiveWidth({
                container : this.el,
                items : this.children.map(function(ch) {return ch.el;}),
                minWidth : 300
            }).setup();

            this.el.appendChild(fragment);

            this.loader.disable().remove();
        },

        _renderEmptyState : function _renderEmptyState() {
            this.appendChild(new CV.EmptyState({
                name : 'empty',
                className : '-pt4 -pb4',
                message : 'there are no pupular users yet.'
            })).render(this.el);

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
