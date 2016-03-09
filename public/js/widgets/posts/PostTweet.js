var moment = require('moment')
  , Events = require('./../../lib/events');

Class(CV, 'PostTweet').inherits(CV.Post)({
  ELEMENT_CLASS: 'post-card tweet',
  HTML: '\
    <article>\
      <div class="post-card-info -text-left">\
        <div class="post-card-meta">\
          <span class="post-card-meta-source"></span>\
          on <time class="post-card-meta-date" datetime=""></time>\
        </div>\
        <div class="-clearfix -mb1">\
          <img class="post-tweet-avatar -float-left -mr1" width="48" height="48"/>\
          <div class="-overflow-hidden">\
            <h2 class="post-card-title"></h2>\
          </div>\
        </div>\
        <p class="post-card-description"></p>\
        <div class="post-card-activity">\
          <div class="post-card-activity-saved -inline-block">\
            <svg class="post-card-activity-svg">\
              <use xlink:href="#svg-save-outline"></use>\
            </svg>\
            <span class="post-card-activity-label">0</span>\
          </div>\
        </div>\
      </div>\
    </article>',
  ICON: '<svg class="post-card-meta-icon"><use xlink:href="#svg-twitter-bird"></use></svg>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.infoWrapperElement = this.el.querySelector('.post-card-info');
      this.titleElement = this.el.querySelector('.post-card-title');
      this.descriptionElement = this.el.querySelector('.post-card-description');
      this.sourceElement = this.el.querySelector('.post-card-meta-source');
      this.savedElement = this.el.querySelector('.post-card-activity-saved > .post-card-activity-label');
      this.dateTimeElement = this.el.querySelector('.post-card-meta-date');
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.el.querySelector('.post-card-meta').insertAdjacentHTML('afterbegin', this.constructor.ICON);
      this.sourceElement.insertAdjacentHTML('beforeend', 'from <a href="https://twitter.com/" target="_blank">Twitter</a> ');
      this.dom.updateText(this.dateTimeElement, moment(this.publishedAt || new Date()).format('MMM DD, YYYY'));
      this.dom.updateAttr('datetime', this.dateTimeElement, this.publishedAt || new Date());
      this.dom.updateAttr('src', this.el.querySelector('.post-tweet-avatar'), this.extras.profileImageURL);
      this.dom.updateText(this.titleElement, this.dom.decodeHTML(this.title));
      this.dom.updateText(this.descriptionElement, this.dom.decodeHTML(this.description).trim());
      this.updateSaves(this);
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._clickCardEventHandlerRef = this._clickCardEventHandler.bind(this);
      Events.on(this.infoWrapperElement, 'click', this._clickCardEventHandlerRef);
    },

    _clickCardEventHandler: function _clickCardEventHandler() {
      this.dispatch('post:display:detail', {data: this});
    },

    /* Implementation for the destroy method.
     * This is run by the destroy method on CV.Post
     * @private
     */
    __destroy: function __destroy() {
      return null;
    }
  }
});
