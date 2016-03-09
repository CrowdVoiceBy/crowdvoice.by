/* globals App */
var API = require('../../../lib/api');

Class(CV, 'PostModerateOriginalButton').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
  HTML : '\
    <button class="-abs cv-button post-moderate-view-original-btn -m0 -color-primary">\
      <svg class="-s16 -mr1">\
        <use xlink:href="#svg-sources"></use>\
      </svg>\
      <span>View Source</span>\
    </button>\
  ',

  prototype : {
    originalUrl : '',

    init : function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._bindEvents();
    },

    _bindEvents : function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      this.el.addEventListener('click', this._clickHandlerRef);
    },

    _clickHandler : function _clickHandler() {
      window.open(this.originalUrl);
    },

    destroy : function destroy() {
      Widget.prototype.destroy.call(this);

      this.el.removeEventListener('click', this._clickHandlerRef);
      this._clickHandlerRef = null;

      return null;
    }
  }
});
