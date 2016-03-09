var origin = require('get-location-origin');
var Events = require('./../../../lib/events');

Class(CV, 'VoiceFooterShareButton').inherits(Widget)({
  HTML : '\
    <button class="cv-button tiny ui-has-tooltip">\
      <svg class="voice-footer-svg">\
        <use xlink:href="#svg-share"></use>\
      </svg>\
      <span class="ui-tooltip -bottom -nw">Share Voice</span>\
    </button>',

  prototype: {
    voice: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._bindEvents();
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.el, 'click', this._clickHandlerRef);
    },

    /* Renders the SharePopover.
     * @method _clickHandler <private>
     * @return undefined
     */
    _clickHandler: function _clickHandler() {
      if (this.popover) {
        this.popover = this.popover.destroy();
      }

      this.appendChild(new CV.PopoverBlocker({
        name: 'popover',
        className: 'voice-share-popover share-popover',
        placement: 'bottom-right',
        content: new CV.PopoverShare({
          name: 'shareItems',
          data: {
            url: origin + '/' + this.voice.owner.profileName + '/' + this.voice.slug + '/',
            title: this.voice.title
          }
        }).el
      })).render(this.parent.el).activate();
    },

    destroy: function destroy() {
      Events.off(this.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
