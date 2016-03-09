var API = require('./../lib/api');

Class(CV.Views, 'DiscoverBrowse').includes(NodeSupport, CV.WidgetUtils)({
  prototype : {
    /* Existing Topics.
     * @property topicsData <required> [Array] TopicsPresenter
     */
    topicsData : null,
    trendingImage : null,
    newestImage : null,
    recommendedImage : null,

    init: function init(config) {
      Object.keys(config || {}).forEach(function(propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      this.trendingImage = document.querySelector('.browse-element-button-trending');
      this.newestImage = document.querySelector('.browse-element-button-newest');
      this.recommendedImage = document.querySelector('.browse-element-button-recommended');

      if (this.trendingImage) { this._requestTrendingImage(); }
      if (this.newestImage) { this._requestNewestImage(); }
      if (this.recommendedImage) { this._requestRecommendedImage(); }

      this._setup();
    },

    _setup: function _setup() {
      this.appendChild(new CV.TabsManager({
        name: 'tabs',
        useHash: true,
        nav: document.querySelector('.profile-menu'),
        content: document.querySelector('.profile-menu-content')
      }));

      this.tabs.addTab({
        name: 'voices',
        title: 'Voices',
        content : CV.DiscoverBrowseVoicesTab
      });

      this.tabs.addTab({
        name: 'people',
        title: 'People',
        content: CV.DiscoverBrowsePeopleTab
      });

      this.tabs.addTab({
        name: 'organizations',
        title: 'Organizations',
        content: CV.DiscoverBrowseOrganizationsTab
      });
      this.tabs.addTabIndicator().start();

      var topicsHolder = document.querySelector('.topics-list-row');
      var topicsElements = [];
      this.topicsData.forEach(function(topic, index) {
        topicsElements.push(this.appendChild(new CV.TopicCard({
          name: 'topic_' + index,
          className: '-float-left',
          data: topic
        })).render(topicsHolder).el);
      }, this);

      new CV.ResponsiveWidth({
        container: topicsHolder,
        items: [].slice.call(topicsElements, 0),
        minWidth: 300
      }).setup();
    },

    _requestTrendingImage : function _requestTrendingImage() {
      var _this = this;
      API.getTrendingVoices(function (err, res){
        if (err) { return; }
        _this.dom.updateBgImage(_this.trendingImage.querySelector('.browse-bg-image'), res[0].images.card.url);
      });
    },

    _requestNewestImage : function _requestNewestImage() {
      var _this = this;
      API.getNewVoices(function (err, res){
        if (err) { return; }
        _this.dom.updateBgImage(_this.newestImage.querySelector('.browse-bg-image'), res[0].images.card.url);
      });
    },

    _requestRecommendedImage : function _requestRecommendedImage(){
      var _this = this;
      API.getBrowseFeaturedVoices(function (err, res){
        if (err) { return; }
        _this.dom.updateBgImage(_this.recommendedImage.querySelector('.browse-bg-image'), res[0].images.card.url);
      });
    }
  }
});
