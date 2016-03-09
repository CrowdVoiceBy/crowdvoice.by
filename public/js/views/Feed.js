var Events = require('./../lib/events');

Class(CV.Views, 'Feed').includes(NodeSupport, CV.WidgetUtils)({
  prototype: {
    organization: null,
    feedItems: null,
    topVoice: null,

    init: function init(config) {
      Object.keys(config || {}).forEach(function(propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      this._window = window;
      this._body = document.body;
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      var time = 1000;

      if (this.topVoice) {
        this.appendChild(new CV.TopVoice({
          name: 'topVoice',
          data: this.topVoice,
          ENV: this.ENV
        })).render(this.el.querySelector('.feed-top-voice'));
      }

      this.appendChild(new CV.FeedFeaturedVoices({
        name: 'featuredVoices',
        element: this.el.querySelector('.feed__featured-voices')
      }));
      window.setTimeout(function(_that) {
        _that.featuredVoices.fetch();
      }, time, this);

      this.appendChild(new CV.FeedRecommended({
        name: 'recommended',
        element: this.el.querySelector('.feed__recommended')
      }));
      window.setTimeout(function(_that) {
        _that.recommended.fetch();
      }, time + 1, this);

      this.appendChild(new CV.FeedDiscover({
        name: 'discover',
        element: $(this.el.querySelector('.feed__discover'))
      }));
      window.setTimeout(function(_that) {
        _that.discover.fetchImages();
      }, time + 2, this);

      this.appendChild(new CV.FeedSidebar({
        name : 'sidebar',
        el : this.el.querySelector('[data-feed-sidebar]'),
        feedItems: this.feedItems,
        organization: this.organization
      }));

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._scrollHandlerRef = this._scrollHandler.bind(this);
      Events.on(this._window, 'scroll', this._scrollHandlerRef);
    },

    /* Handle the _window scroll event.
     * @private
     */
    _scrollHandler: function _scrollHandler(ev) {
      var el = ev.currentTarget;
      if (el.scrollY >= 400) {
        this.sidebar.el.classList.add('-is-fixed');
      } else {
        this.sidebar.el.classList.remove('-is-fixed');
      }
    }
  }
});
