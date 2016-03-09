var moment = require('moment');
var Events = require('./../../lib/events');

Class(CV, 'PostDetailSidebarItem').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
  ELEMENT_CLASS : 'cv-post-detail__sidebar-item -rel -clearfix -clickable',
  HTML : '\
    <div>\
      <div class="pd-sidebar-item__icon-wrapper">\
        <div class="-table -full-height">\
          <div class="-table-cell -vam"></div>\
        </div>\
      </div>\
      <div class="pd-sidebar-item__info -overflow-hidden">\
        <p class="pd-sidebar-item__title -font-bold"></p>\
        <div class="pd-sidebar-item-meta">\
          <span class="pd-sidebar-item-meta__source"></span>\
          on <time class="pd-sidebar-item-meta__date" datetime=""></time>\
        </div>\
      </div>\
    </div>',

    FAVICON : '<img class="pd-sidebar-item-meta__icon-image" src="{src}"/>',

    ICON : {
      link: '<svg class="pd-sidebar-item-meta__icon"><use xlink:href="#svg-link"></use></svg>',
      image: '<svg class="pd-sidebar-item-meta__icon"><use xlink:href="#svg-image"></use></svg>',
      video: '<svg class="pd-sidebar-item-meta__icon"><use xlink:href="#svg-video"></use></svg>',
      text: '<svg class="pd-sidebar-item-meta__icon"><use xlink:href="#svg-article"></use></svg>',
    },

  THUMB_TEMPLATE : '<div class="pd-sidebar-item__cover-wrapper -float-left -img-cover" style="background-image: url({source});"></div>',

  prototype : {
    data: null,

    /* @param {Object} config
     * @param {Object} config.data - the PostInstance data
     */
    init : function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.sourceElement = this.el.querySelector('.pd-sidebar-item-meta__source');
      this.dateTimeElement = this.el.querySelector('.pd-sidebar-item-meta__date');

      this._setup()._bindEvents();
    },

    _setup : function _setup() {
      this.el.querySelector('.pd-sidebar-item__icon-wrapper .-table-cell').insertAdjacentHTML('afterbegin', this.constructor.ICON[this.data.sourceType]);

      if (this.data.postImages && this.data.postImages.medium) {
        var thumb = this.constructor.THUMB_TEMPLATE.replace(/{source}/, this.data.postImages.medium.url);
        this.el.insertAdjacentHTML('afterbegin', thumb);
      }

      this.dom.updateText(this.el.querySelector('.pd-sidebar-item__title'), this.data.title);

      if (this.data.faviconPath) {
        this.el.querySelector('.pd-sidebar-item-meta').insertAdjacentHTML('afterbegin', this.constructor.FAVICON.replace(/{src}/, this.data.faviconPath));
        this.sourceElement.insertAdjacentHTML('beforeend', 'from <a href="' + this.data.sourceDomain + '" target="_blank">'+ this.data.sourceDomain.replace(/.*?:\/\/(w{3}.)?/g, "") + '</a> ');
      } else {
        this.el.querySelector('.pd-sidebar-item-meta').insertAdjacentHTML('afterbegin', this.constructor.ICON[this.data.sourceType]);
        this.dom.updateText(this.sourceElement, 'posted ');
      }

      this.dom.updateText(this.dateTimeElement, moment(this.data.publishedAt).format('MMM DD, YYYY'));
      this.dom.updateAttr('datetime', this.dateTimeElement, this.data.publishedAt);

      return this;
    },

    _bindEvents : function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.el, 'click', this._clickHandlerRef);
      return this;
    },

    _clickHandler : function _clickHandler() {
      this.dispatch('sidebarItemClicked', {data: this.data});
    }
  }
});
