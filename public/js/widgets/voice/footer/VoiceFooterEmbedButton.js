Class(CV, 'VoiceFooterEmbedButton').inherits(Widget)({
  HTML : '\
    <button class="cv-button tiny ui-has-tooltip">\
      <svg class="voice-footer-svg">\
        <use xlink:href="#svg-embed"></use>\
      </svg>\
      <span class="ui-tooltip -bottom -nw">Embed Voice</span>\
    </button>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);

      this.el = this.element[0];
      this._bindEvents();
    },

    _bindEvents: function _bindEvents(){
      this.el.addEventListener('click', this._clickHandler.bind(this));
      return this;
    },

    _clickHandler: function _clickHandler() {
      this.appendChild(new CV.UI.EmbedOverlay({
        name : 'embedOverlay'
      })).render(document.body).activate();
    }
  }
});
