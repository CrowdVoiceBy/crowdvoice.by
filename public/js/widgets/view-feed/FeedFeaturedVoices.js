var API = require('./../../lib/api');

Class(CV, 'FeedFeaturedVoices').inherits(Widget).includes(CV.WidgetUtils)({
  prototype: {
    MAX_VOICES: 3,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element;

      this.appendChild(new CV.Loading({
        name: 'loader'
      })).render(this.el.querySelector('.feed__featured-voices-list')).center().setStyle({
        top: '80px'
      });
    },

    /* Fetch and render the first 3 featured voices.
     * Hides the loader on success response.
     * @public
     * @return FeedFeaturedVoices
     */
    fetch: function fetch() {
      API.getBrowseFeaturedVoices(this._fetchResponse.bind(this));
      return this;
    },

    /* Handles the `fetch` response.
     * @private
     */
    _fetchResponse: function _fetchResponse(err, res) {
      var container = this.el.querySelector('.feed__featured-voices-list');
      var fragment = document.createDocumentFragment();

      if (res.length > this.MAX_VOICES) {
        res = res.slice(0,this.MAX_VOICES);
      }

      res.forEach(function(voice, index) {
        this.appendChild(new CV.VoiceCoverMediumList({
          name: 'top_voice_' + index,
          className: '-pb3',
          data: voice
        })).render(fragment);
      }, this);

      container.appendChild(fragment);
      this.loader.disable().remove();
    }
  }
});
