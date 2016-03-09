var Events = require('./../../lib/events');

Class(CV, 'EmbedVoiceDescription').inherits(Widget)({
  ELEMENT_CLASS : 'about-description-box',

  HTML : '\
    <div>\
      <header class="about-description-box__header -clearfix">\
        <h3 class="about-description-box__title -font-bold -float-left">About this Voice</h3>\
      </header>\
      <p></p>\
    </div>\
    ',

  prototype : {
    /* @param {Object} config - the configuration object
     * @property {Object} config.data
     * @property {string} config.data.description - the voice description text.
     */
    init : function init (config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup()._bindEvents();
    },

    /* Instantiate widget’s children.
     * @private
     */
    _setup : function _setup () {
      this.appendChild(new CV.UI.Button({
        name : 'hideButton',
        className : 'about-description-box__hide-button micro -float-right',
        data : {value: 'Hide'}
      })).render(this.el.querySelector('header'));
      return this;
    },

    /* Subscribe widget’s events.
     * @private
     */
    _bindEvents : function _bindEvents () {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.hideButton.el, 'click', this._clickHandlerRef);
      return this;
    },

    /* Sets the description text.
     * @public
     */
    updateText : function updateText (description) {
      this.el.querySelector('p').textContent = description;
      return this;
    },

    /* Handles the hideButton click event.
     * @private
     */
    _clickHandler : function _clickHandler () {
      this.parent.hideDescription();
    },

    /* Implementation of the destroy method.
     * @override|public
     */
    destroy : function destroy () {
      Widget.prototype.destroy.call(this);
      Events.off(this.hideButton.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      return null;
    }
  }
});
