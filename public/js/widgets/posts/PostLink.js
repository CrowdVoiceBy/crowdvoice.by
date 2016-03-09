var moment = require('moment')
  , Events = require('./../../lib/events');

Class(CV, 'PostLink').inherits(CV.Post)({
  HTML: '\
    <article class="post-card link">\
      <div class="post-card-image-wrapper">\
        <svg class="post-card-svg-magnifier">\
          <use xlink:href="#svg-magnifier"></use>\
        </svg>\
      </div>\
      <div class="post-card-info -text-left">\
        <div class="post-card-meta">\
          <span class="post-card-meta-source"></span>\
          on <time class="post-card-meta-date" datetime=""></time>\
        </div>\
        <h2 class="post-card-title"></h2>\
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

  ICON: '<svg class="post-card-meta-icon"><use xlink:href="#svg-link"></use></svg>',

  prototype: {
    /* PRIVATE properties */
    el: null,
    titleElement: null,
    descriptionElement: null,
    imageWrapperElement: null,
    sourceElement: null,
    dateTimeElement: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.imageWrapperElement = this.el.querySelector('.post-card-image-wrapper');
      this.infoWrapperElement = this.el.querySelector('.post-card-info');
      this.titleElement = this.el.querySelector('.post-card-title');
      this.descriptionElement = this.el.querySelector('.post-card-description');
      this.sourceElement = this.el.querySelector('.post-card-meta-source');
      this.dateTimeElement = this.el.querySelector('.post-card-meta-date');
      this.savedElement = this.el.querySelector('.post-card-activity-saved > .post-card-activity-label');
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      if (this.hasCoverImage()) {
        this.setImageHeight(this.imageMeta.medium.height);
      } else {
        this.imageLoaded = true;
      }

      if (this.faviconPath) {
        this.el.querySelector('.post-card-meta').insertAdjacentHTML('afterbegin', this.constructor.FAVICON.replace(/{src}/, this.faviconPath));
        this.sourceElement.insertAdjacentHTML('beforeend', 'from <a href="' + this.sourceDomain + '" target="_blank">'+ this.sourceDomain.replace(/.*?:\/\/(w{3}.)?/g, "") + '</a> ');
      } else {
        this.el.querySelector('.post-card-meta').insertAdjacentHTML('afterbegin', this.constructor.ICON);
        this.dom.updateText(this.sourceElement, 'posted ');
      }

      this.dom.updateText(this.dateTimeElement, moment(this.publishedAt).format('MMM DD, YYYY'));
      this.dom.updateAttr('datetime', this.dateTimeElement, this.publishedAt);

      this.dom.updateText(this.titleElement, this.dom.decodeHTML(this.title));
      this.dom.updateText(this.descriptionElement, this.dom.decodeHTML(this.description).trim());

      this.updateSaves(this);

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._clickImageHandlerRef = this._clickImageHandler.bind(this);
      Events.on(this.imageWrapperElement, 'click', this._clickImageHandlerRef);
      Events.on(this.infoWrapperElement, 'click', this._clickImageHandlerRef);
      return this;
    },

    _clickImageHandler: function _bindEvents() {
      this.dispatch('post:display:detail', {data: this});
    },

    /* Implementation for the destroy method.
     * This is run by the destroy method on CV.Post
     * @private
     */
    __destroy: function __destroy() {
      Events.off(this.imageWrapperElement, 'click', this._clickImageHandlerRef);
      Events.off(this.infoWrapperElement, 'click', this._clickImageHandlerRef);
      this._clickImageHandlerRef = null;

      this.el = null;
      this.imageWrapperElement = null;
      this.sourceElement = null;
      this.dateTimeElement = null;
    }
  }
});
