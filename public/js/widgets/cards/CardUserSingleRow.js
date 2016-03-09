Class(CV, 'CardUserSingleRow').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
  ELEMENT_CLASS: 'card-user-single-row',

  HTML: '\
    <article role="article">\
      <img class="card-user-single-row__img -s16 -rounded" width="16" height="16"/>\
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

      this.dom.updateAttr('src', imageElement, this.data.images.icon.url);
      this.dom.updateAttr('alt', imageElement, this.data.name + '’s avatar image');
      this.dom.updateText(spanElement, this.data.name);
    }
  }
});
