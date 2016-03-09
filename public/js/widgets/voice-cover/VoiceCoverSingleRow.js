Class(CV, 'VoiceCoverSingleRow').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
  ELEMENT_CLASS: 'voice-cover-single-row',

  HTML: '\
    <article role="article">\
      <img class="voice-cover-single-row__img -s18" width="18" height="18"/>\
      <span></span>\
    </article>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this._setup();
    },

    /* Replace the widget contents with the config received on config.
     * @private
     */
    _setup : function _setup() {
      var el = this.element[0]
        , imageElement = el.querySelector('img')
        , spanElement = el.querySelector('span');

      if (this.labelClassName) this.dom.addClass(spanElement, this.labelClassName.split(/\s/));

      if (this.data.images.small) {
        this.dom.updateAttr('src', imageElement, this.data.images.small.url);
        this.dom.updateAttr('alt', imageElement, this.data.name + '’s voice cover image');
      } else {
        this.dom.updateAttr('src', imageElement, '/img/placeholder-image.png');
      }
      this.dom.updateText(spanElement, this.data.name);
    }
  }
});
