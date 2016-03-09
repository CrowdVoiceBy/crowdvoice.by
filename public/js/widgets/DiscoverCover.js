Class(CV, 'DiscoverCover').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'discover-cover -rel',

  HTML: '\
    <div>\
      <div class="discover-cover__wrapper -rel">\
        <div class="discover-cover__bg-image -abs -img-cover -full-width -full-height"></div>\
      </div>\
      <a href="#" class="discover-cover-hover-overlay -abs -tdn -full-width -full-height">\
        <div class="-table -full-width -full-height">\
          <div class="-table-cell -vam -text-center">\
            <p class="discover-cover-text -font-bold -upper">Trending</p>\
          </div>\
        </div>\
      </a>\
    </div>',

  SVG_TEMPLATE: '\
    <div class="discover-cover-svg-wrapper -rel">\
      <svg class="-abs -full-width -full-height">\
        <use xlink:href="#svg-{iconId}"></use>\
      </svg>\
    </div>',

  prototype: {
    /* @param {Object} config
     * @property {Object} config.data
     * @property {string} config.data.text
     * @property {string} config.data.iconId
     */
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      if (this.data) {
        this._setup();
      }
    },

    _setup: function _setup() {
      if (this.data.text) {
        this.dom.updateText(this.el.querySelector('.discover-cover-text'), this.data.text);
      }

      if (this.data.icon) {
        var icon = this.constructor.SVG_TEMPLATE.replace(/{iconId}/, this.data.icon);
        this.el.querySelector('.-table-cell').insertAdjacentHTML('afterbegin', icon);
      }

      if (this.data.url) {
        this.dom.updateAttr('href', this.el.querySelector('.discover-cover-hover-overlay'), this.data.url);
      }
    },

    updateBg: function updateBg(background) {
      this.dom.updateBgImage(this.el.querySelector('.discover-cover__bg-image'), background);
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
