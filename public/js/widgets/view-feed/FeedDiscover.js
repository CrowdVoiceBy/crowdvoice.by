var API = require('./../../lib/api');

Class(CV, 'FeedDiscover').inherits(Widget)({
  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      this._setup();
    },

    _setup: function _setup() {
      this.appendChild(new CV.DiscoverCover({
        name: 'trendingCover',
        data: {
          text: 'Trending',
          icon: 'trending',
          url: '/discover/trending/'
        }
      })).render(this.el.querySelector('.feed__discover-cover.trending'));

      this.appendChild(new CV.DiscoverCover({
        name: 'newestCover',
        data: {
          text: 'Newest',
          icon: 'new',
          url: '/discover/new/'
        }
      })).render(this.el.querySelector('.feed__discover-cover.newest'));

      this.appendChild(new CV.DiscoverCover({
        name: 'exploreAllCover',
        data: {
          text: 'Explore All',
          icon: 'browse',
          url: '/discover/browse/'
        }
      })).render(this.el.querySelector('.feed__discover-cover.browse'));

      return this;
    },

    fetchImages: function fetchImages() {
      API.getTrendingVoices(function (err, res){
        if (err) {return;}
        var r = res[Math.floor(Math.random()*res.length)];
        this.trendingCover.updateBg(r.images.card.url);
      }.bind(this));

      API.getNewVoices(function (err, res){
        if (err) {return;}
        var r = res[Math.floor(Math.random()*res.length)];
        this.newestCover.updateBg(r.images.card.url);
      }.bind(this));

      API.getBrowseFeaturedVoices(function (err, res){
        if (err) {return;}
        var r = res[Math.floor(Math.random()*res.length)];
        this.exploreAllCover.updateBg(r.images.card.url);
      }.bind(this));
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
