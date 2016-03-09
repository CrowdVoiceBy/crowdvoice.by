var API = require('./../../lib/api');

Class(CV, 'FeedRecommended').inherits(Widget).includes(CV.WidgetUtils)({
  prototype: {
    MAX_VOICES: 3,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element;
      this.voicesList = this.el.querySelector('.feed__recommended-voices-list');
      this.usersList = this.el.querySelector('.feed__recommended-users-list');

      this.appendChild(new CV.Loading({
        name: 'voicesLoader'
      })).render(this.voicesList).center().setStyle({
        top: '80px'
      });

      this.appendChild(new CV.Loading({
        name : 'usersLoader'
      })).render(this.usersList).center().setStyle({
        top: '80px'
      });
    },

    /* Fetch and render the first 3 featured voices.
     * Hides the loader on success response.
     * @public
     * @return FeedFeaturedVoices
     */
    fetch: function fetch() {
      API.getRecommened(this._fetchResponse.bind(this));
      return this;
    },

    /* Handles the `fetch` response.
     * @private
     */
    _fetchResponse: function _fetchResponse(err, res) {
      if (res.length === 0) {
        return this._displayNoRecommendations();
      }

      if (res[0].voices.length) {
        this.appendChild(new CV.DiscoverRecommendedSectionItem({
          name: 'voicesSection',
          data: res[0]
        })).render(this.voicesList);

        this._addVoices(res[0].voices, 3);
      }

      if (res[0].people.length) {
        this.appendChild(new CV.DiscoverRecommendedSectionItem({
          name: 'usersSection',
          data: res[0]
        })).render(this.usersList);

        this._addCards(res[0].people, 3);
      }
    },

    _addVoices: function _addVoices(voices, limit) {
      var fragment = document.createDocumentFragment();
      var len = voices.length;

      if (limit && (limit < len)) {
        len = limit;
      }

      for (var i = 0; i < len; i++) {
        fragment.appendChild(this.appendChild(new CV.VoiceCoverMediumList({
          name: 'voice_' + i,
          className: '-mb3',
          data: voices[i]
        })).el);
      }

      this.voicesSection.containerElement.classList.add('-pt2');
      this.voicesSection.containerElement.appendChild(fragment);
      this.voicesLoader.disable().remove();

      return this;
    },

    _addCards: function _addCards(entities, limit) {
      var fragment = document.createDocumentFragment();
      var len = entities.length;

      if (limit && (limit < len)) {
        len = limit;
      }

      for (var i = 0; i < len; i++) {
        fragment.appendChild(this.appendChild(new CV.Card({
          name: 'entities_' + i,
          data: entities[i],
          className: '-float-left'
        })).el);
      }

      this.usersSection.containerElement.className += ' data-container -pt2 -clearfix';
      this.usersSection.containerElement.appendChild(fragment);
      this.usersLoader.disable().remove();

      return this;
    },

    _displayNoRecommendations: function _displayNoRecommendations() {
      this.destroy();
    }
  }
});
