var moment = require('moment');
var Events = require('./../../lib/events');

Class(CV, 'PostVideo').inherits(CV.Post)({
  ELEMENT_CLASS : 'post-card video',

  HTML : '\
    <article>\
      <div class="post-card-inner">\
        <div class="post-card-image-wrapper">\
          <div class="post-card-play-button">\
            <svg class="post-card-svg-play">\
              <use xlink:href="#svg-play"></use>\
            </svg>\
          </div>\
        </div>\
        <div class="post-card-info -text-left">\
          <div class="post-card-meta">\
            <span class="post-card-meta-source"></span>\
            on <time class="post-card-meta-date" datetime=""></time>\
          </div>\
          <h2 class="post-card-title"></h2>\
          <p class="post-card-description"></p>\
        </div>\
      </div>\
    </article>',

  ICON : '<svg class="post-card-meta-icon"><use xlink:href="#svg-video"></use></svg>',

  prototype : {
    init : function init (config) {
      Widget.prototype.init.call(this, config);

      this.el = this.element[0];
      this.imageWrapperElement = this.el.querySelector('.post-card-image-wrapper');
      this.infoWrapperElement = this.el.querySelector('.post-card-info');
      this.titleElement = this.el.querySelector('.post-card-title');
      this.descriptionElement = this.el.querySelector('.post-card-description');
      this.sourceElement = this.el.querySelector('.post-card-meta-source');
      this.dateTimeElement = this.el.querySelector('.post-card-meta-date');

      this._setup()._bindEvents();
    },

    _setup : function _setup () {
      this.el.dataset.date = moment(this.publishedAt).format('YYYY-MM-DD');

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

      return this;
    },

    _bindEvents : function _bindEvents () {
      this._clickImageHandlerRef = this._clickImageHandler.bind(this);
      Events.on(this.imageWrapperElement, 'click', this._clickImageHandlerRef);
      Events.on(this.infoWrapperElement, 'click', this._clickImageHandlerRef);
      return this;
    },

    _clickImageHandler : function _clickImageHandler () {
      this.dispatch('post:display:detail', {data: this});
    },

    destroy : function destroy () {
      CV.Post.prototype.destroy.call(this);

      Events.off(this.imageWrapperElement, 'click', this._clickImageHandlerRef);
      Events.off(this.infoWrapperElement, 'click', this._clickImageHandlerRef);
      this._clickImageHandlerRef = null;

      return null;
    }
  }
});
