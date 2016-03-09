var origin = require('get-location-origin');
var Events = require('./../../lib/events');

Class(CV, 'EmbedHeaderShareButton').inherits(Widget)({
  prototype : {
    init : function init (config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      this._setup()._bindEvents();
    },

    _setup : function _setup () {
      this.appendChild(new CV.UI.Button({
        name : 'button',
        className : 'tiny ' + this.theme,
      }))
      .updateHTML('<svg class="-s16"><use xlink:href="#svg-share"></use></svg>')
      .render(this.el);
      return this;
    },

    /* Subscribe the widget events.
     * @private
     */
    _bindEvents : function _bindEvents () {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.button.el, 'click', this._clickHandlerRef);
      return this;
    },

    /* Handles the click on the share button.
     * @private
     */
    _clickHandler : function _clickHandler () {
      if (this.popover) {
        this.popover = this.popover.destroy();
      }

      this.appendChild(new CV.PopoverBlocker({
        name : 'popover',
        className : 'voice-share-popover share-popover',
        placement : 'bottom-right',
        content : new CV.PopoverShare({
          name : 'shareItems',
          data : {
            url : origin + '/' + this.voiceData.owner.profileName + '/' + this.voiceData.slug + '/',
            title : this.voiceData.title
          }
        }).el
      })).render(this.el).activate();
    },

    destroy : function destroy () {
      Events.off(this.button.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
