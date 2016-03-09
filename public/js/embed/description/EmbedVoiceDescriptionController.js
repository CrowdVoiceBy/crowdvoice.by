var Events = require('./../../lib/events');

Class(CV, 'EmbedVoiceDescriptionController').includes(NodeSupport, CustomEventSupport)({
  ELEMENT_CLASS : '-inline-block',

  prototype : {
    /* @param {Object} config - the configuration object
     * @property {Object} config.data
     * @property {string} config.data.description - the voice description text.
     * @property {Object} config.data.aboutButtonContainer
     * @property {Object} config.data.boxContainer
     */
    init : function init (config) {
      Object.keys(config).forEach(function (propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      this._setup()._bindEvents();
    },

    /* Instantiate the aboutButton and descriptionBox Widgets.
     * @private
     */
    _setup : function _setup () {
      this.appendChild(new CV.UI.Button({
        name : 'aboutButton',
        className : 'about-description-button micro -ghost',
        data : {value: 'About'}
      })).render(this.data.aboutButtonContainer);

      this.appendChild(new CV.EmbedVoiceDescription({
        name : 'descriptionBox',
      })).updateText(this.data.description).render(this.data.boxContainer);
      return this;
    },

    /* Subscribe widget’s events.
     * @private
     */
    _bindEvents : function _bindEvents () {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.aboutButton.el, 'click', this._clickHandlerRef);
      return this;
    },

    /* Handles the hideButton click event.
     * @private
     */
    _clickHandler : function _clickHandler () {
      this.showDescription();
    },

    /* Shows the descriptionBox and hides the aboutButton
     * @public
     */
    showDescription : function showDescription () {
      this.aboutButton.deactivate();
      this.descriptionBox.activate();
      this.dispatch('showDescription');
      return this;
    },

    /* Shows the aboutButton and hides the descriptionBox
     * @public
     */
    hideDescription : function hideDescription () {
      this.descriptionBox.deactivate();
      this.aboutButton.activate();
      this.dispatch('hideDescription');
      return this;
    },

    /* Implementation of the destroy method.
     * @override|public
     */
    destroy : function destroy () {
      Widget.prototype.destroy.call(this);
      Events.off(this.aboutButton.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      return null;
    }
  }
});
