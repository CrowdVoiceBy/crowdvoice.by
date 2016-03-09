Class(CV, 'PostCreatorFromSourcesSourceGoogleNews').inherits(Widget).includes(CV.WidgetUtils)({
  HTML: '\
    <div>\
      <div data-list></div>\
      <div class="pcfs__google-news-notice">\
        <div class="-pr2">\
          <p class="-font-bold">Google News only allow us to search for the top 10 result</p>\
          <p>You can search more extensively directly in Google News and add content via URL</p>\
        </div>\
        <div>\
          <a data-external-url class="cv-button tiny -nw" href="#" target="_blank">Search in Google News</a>\
        </div>\
      </div>\
    </div>',

  GOOGLE_NEWS_URL: 'https://news.google.com/',

  prototype: {
    /* the results data to be rendered */
    data: null,
    query: '',

    init: function init(config) {
      Widget.prototype.init.call(this, config);

      var child = CV[this.constructor.className + 'Item']
        , fragment = document.createDocumentFragment();

      this.data.forEach(function(data, index) {
        this.appendChild(new child({
          name: 'item-gn-' + index,
          data: data
        })).render(fragment);
      }, this);

      this.element[0].querySelector('[data-list]').appendChild(fragment);
      this.element[0].querySelector('[data-external-url]').href = this.constructor.GOOGLE_NEWS_URL + '?q=' + encodeURIComponent(this.query);
    }
  }
});
