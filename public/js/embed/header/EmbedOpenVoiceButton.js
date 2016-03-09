var origin = require('get-location-origin');
var Values = require('values.js');
var Syringe = require('syringe.js');

Class(CV, 'EmbedOpenVoiceButton').inherits(Widget)({
  ELEMENT_CLASS : 'header-open-voice-button-container -inline-block',
  BUTTON_CLASSNAME : 'header-open-voice-button',

  prototype : {
    /* @param {Object} config - widget’s configuration settings
     * @property {string} config.accent - embeddable widget accent color.
     */
    init : function init (config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup();
    },

    /* Instantiate widget’s children.
     * @private
     */
    _setup : function _setup () {
      this._injectDynamicButtonStyles(this.accent);

      this.appendChild(new CV.UI.Button({
        name : 'openVoiceButton',
        className : this.constructor.BUTTON_CLASSNAME + ' tiny -inline-block',
        data : {
          href: origin + '/' + this.voiceData.owner.profileName + '/' + this.voiceData.slug + '/',
          attr : {
            target: '_blank',
            title: 'Edit ' + this.voiceData.title + ' voice'
          }
        }
      })).updateHTML('<svg class="-s14"><use xlink:href="#svg-add"></use></svg>')
      .render(this.el);

      return this;
    },

    /* @private
     */
    _injectDynamicButtonStyles : function _injectDynamicButtonStyles (accent) {
      var color = new Values(accent);
      var isLight = (color.getBrightness() > 75);
      var fillColor = isLight ? '#000' : '#fff';
      var buttonStyle = {};

      buttonStyle['.' + this.constructor.BUTTON_CLASSNAME] = {
        backgroundColor : color.hexString(),
        borderColor : color.shade(20).hexString(),
        fill : fillColor
      };

      buttonStyle['.' + this.constructor.BUTTON_CLASSNAME + ':hover:enabled'] = {
        backgroundColor : color[isLight ? 'shade' : 'tint'](15).hexString(),
        fill : fillColor,
        borderColor : color.shade(20).hexString()
      };

      var activeRules = {
        backgroundColor : color.shade(15).hexString(),
        borderColor : color.shade(30).hexString(),
      };
      buttonStyle['.' + this.constructor.BUTTON_CLASSNAME + ':active'] = activeRules;
      buttonStyle['.' + this.constructor.BUTTON_CLASSNAME + ':active:hover:enabled'] = activeRules;

      Syringe.inject(buttonStyle);

      return this;
    }
  }
});
