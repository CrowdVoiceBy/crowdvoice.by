var API = require('./../lib/api');

Class(CV, 'TopicCard').inherits(Widget).includes(CV.WidgetUtils)({
    HTML : '\
        <div class="topic-card">\
            <div class="card-wrapper">\
                <a class="category_link" href="#" alt="">\
                    <img class="category-icon"/>\
                </a>\
                <p class="category_link-wrapper">\
                    <a class="category_link category_title -font-bold" href="#" alt=""></a>\
                </p>\
                <p class="featured-text"><span class="middle-line">FEATURED VOICES</span></p>\
                <div class="voice-card-container -text-left"></div>\
                <p class="all-voices -text-left">\
                    <a href="" class="topic-card__see-all-link category_link"></a>\
                </p>\
            </div>\
        </div>',

    NO_DATA : '\
        <div class="-table -full-width -full-height">\
            <div class="-table-cell -vam -color-neutral-mid -text-center">no voices to display</div>\
        </div>',

    prototype : {
        /* TopicsPresenter
         * @property data <required> [Object]
         */
        data : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.anchorElements = [].slice.call(this.el.querySelectorAll('.category_link'), 0);
            this.voicesContainer = this.el.querySelector('.voice-card-container');

            this._setup();
        },

        _setup : function _setup() {
            API.getTopicNewestVoices({
                topicSlug : this.data.slug
            }, this._handleGetVoicesResponse.bind(this));

            this.appendChild(new CV.Loading({
                name : 'loader'
            })).center().render(this.voicesContainer);

            this.dom.updateAttr('src', this.el.querySelector('.category-icon'), this.data.images.icon.url);
            this.dom.updateText(this.el.querySelector('.category_title'), this.data.name);

            this.anchorElements.forEach(function(anchor) {
                this.dom.updateAttr('href', anchor, '/topic/' + this.data.slug + '/');
                this.dom.updateAttr('alt', anchor, this.data.name);
            }, this);

            this.dom.updateText(this.el.querySelector('.topic-card__see-all-link'), 'See all ' + this.data.voicesCount + '  Voices ›');

            return this;
        },

        /* Handles the getTopicNewestVoices API call response.
         * @method _handleGetVoicesResponse <private> [Function]
         * @return undefined
         */
        _handleGetVoicesResponse : function _handleGetVoicesResponse(err, res) {
            if (err || !res.voices || !res.voices.length) {
                return this._showNoVoicesToDisplayMessage();
            }

            return this._renderVoices(res);
        },

        /* Display the `no voices to display` message.
         * @method _showNoVoicesToDisplayMessage <private> [Function]
         * @return undefined
         */
        _showNoVoicesToDisplayMessage : function _showNoVoicesToDisplayMessage() {
            this.voicesContainer.insertAdjacentHTML('beforeend', this.constructor.NO_DATA);
            this.loader.disable().remove();
            this.el.querySelector('.topic-card__see-all-link').style.visibility = 'hidden';
        },

        /* Render the voices list.
         * @method _renderVoices <private> [Function]
         * @return undefined
         */
        _renderVoices : function _renderVoices(res) {
            var fragment = document.createDocumentFragment();

            res.voices.forEach(function(voice, index) {
                this.appendChild(new CV.VoiceCoverTitle({
                    name: 'voice_' + index,
                    data: voice
                })).render(fragment);
            }, this);

            this.voicesContainer.appendChild(fragment);

            this.loader.disable().remove();
        }
    }
});
