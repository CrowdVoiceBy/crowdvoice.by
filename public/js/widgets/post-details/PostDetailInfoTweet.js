/* global twttr */
var moment = require('moment')
  , Person = require('./../../lib/currentPerson');

Class(CV, 'PostDetailInfoTweet').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS : 'pd__info-tweet -full-height',
  ICON: '<svg class="post-card-meta-icon"><use xlink:href="#svg-twitter-bird"></use></svg>',
  HTML: '\
    <div>\
      <div class="pd__info-tweet-header -pt2"></div>\
      <div class="pd__info-tweet-body">\
        <p class="pd__info-tweet-meta -mb1">\
          <time></time>\
          <span class="pd__info-tweet-meta__source">\
            <svg class="post-card-meta-icon"><use xlink:href="#svg-twitter-bird"></use></svg>\
            from <a href="https://twitter.com/" target="_blank">Twitter</a>\
          </span>\
        </p>\
        <div class="pd__info-tweet-actions cv-post-detail-actions">\
          <div class="pd__info-tweet-saved -inline-block">\
            <svg class="-s16"><use xlink:href="#svg-save-outline"></use></svg>\
            <span data-saved></span>\
          </div>\
          <div class="cv-button-group multiple"></div>\
        </div>\
      </div>\
    </div>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.savedElement = this.element[0].querySelector('[data-saved]');
      this._setup();
    },

    _setup: function _setup() {
      var el = this.element[0]
        , dateTimeElement = el.querySelector('.pd__info-tweet-meta > time')
        , actionsGroup = el.querySelector('.pd__info-tweet-actions .multiple')
        , tweetId = (this.data.extras.id_str || this.data.sourceUrl.match(/(\d*)$/)[0]);

      twttr.widgets.createTweet(tweetId, el.querySelector('.pd__info-tweet-header'));
      this.dom.updateText(dateTimeElement, moment(this.data.publishedAt).format('MMM DD, YYYY'));
      this.dom.updateAttr('datetime', dateTimeElement, this.data.publishedAt);

      if (Person.get() && (!Person.anon())) {
        this.appendChild(new CV.PostDetailActionsSave({
          name: 'actionSave',
          className: 'dark'
        })).render(actionsGroup).update(this.data);
      }

      this.appendChild(new CV.PostDetailActionsShare({
        name: 'actionShare',
        className: 'dark',
        tooltipPostition: 'top'
      })).render(actionsGroup).update(this.data);

      this.updateSaves(this.data);
    },

    updateSaves: function updateSaves(data) {
      this.dom.updateText(this.savedElement, data.totalSaves || 0);
      return this;
    }
  }
});

