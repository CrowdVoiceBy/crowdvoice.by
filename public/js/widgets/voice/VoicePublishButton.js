var Events = require('./../../lib/events');

Class(CV, 'VoicePublishButton').inherits(Widget).includes(CV.WidgetUtils)({
  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup()._bindEvents();
    },

    /* Initialize widget’s children.
     * @private
     * @return {Object} CV.VoicePublishButton
     */
    _setup: function _setup() {
      this.appendChild(new CV.UI.Button({
        name: 'button',
        className : 'small primary',
        data: {value: 'Publish'}
      })).render(this.el);

      if (this._canBePublish() === false) {
        this.dom.addClass(this.button.el, ['disable']);
      }

      this.appendChild(new CV.VoicePublishOnboardingManager({
        name: 'publishFlowManager',
        publishButtonWrapper: this.el,
        voiceData: this.data.voice
      }));

      requestAnimationFrame(function () {
        this.publishFlowManager.showOnboarding();
      }.bind(this));

      return this;
    },

    /* Subscribe widget’s events.
     * @private
     */
    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.button.el, 'click', this._clickHandlerRef);
    },

    /* Handles the button click event.
     * @private
     */
    _clickHandler: function _clickHandler() {
      if (this._canBePublish() === false) {
        return this.publishFlowManager.showOnboarding();
      }

      if (this.publishModal) {
        this.publishModal = this.publishModal.destroy();
      }

      this.appendChild(new CV.UI.Modal({
        name: 'publishModal',
        title: 'Publish Voice',
        action: CV.Forms.VoicePublish,
        width: 800,
        data: {
          voice: this.data.voice
        }
      })).render(document.body);

      requestAnimationFrame(function () {
        this.publishModal.activate();
      }.bind(this));
    },

    _canBePublish: function _canBePublish() {
      var hasPosts = (this.data.voice.postsCount >= 20)
        , hasImage = (Object.keys(this.data.voice.images).length >= 1);
      return (hasPosts && hasImage);
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      Events.off(this.button.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      return null;
    }
  }
});
