var Events = require('./../../../lib/events')
  , constants = require('./../../../lib/constants');

Class(CV, 'VoiceCoverActionsPublish').inherits(CV.UI.Button)({
  ELEMENT_CLASS: 'cv-button tiny primary -mr1',
  prototype: {
    voiceEntity: null,
    init: function init(config) {
      CV.UI.Button.prototype.init.call(this, config);
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.disable();

      if ((this.voiceEntity.status === constants.VOICE.STATUS_DRAFT) &&
          (this.voiceEntity.postsCount >= 20) &&
          (Object.keys(this.voiceEntity.images).length)) {
        this.enable();
      }

      return this;
    },

    /* Subscribe widget’s events.
     * @private
     */
    _bindEvents: function _bindEvents() {
      if (this.disabled) return;

      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.el, 'click', this._clickHandlerRef);
    },

    /* Handles the button click event.
     * @private
     */
    _clickHandler: function _clickHandler() {
      if (this.publishModal) {
        this.publishModal = this.publishModal.destroy();
      }

      this.appendChild(new CV.UI.Modal({
        name: 'publishModal',
        title: 'Publish Voice',
        action: CV.Forms.VoicePublish,
        width: 800,
        data: {
          voice: this.voiceEntity
        }
      })).render(document.body);

      requestAnimationFrame(function () {
        this.publishModal.activate();
      }.bind(this));
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      Events.off(this.button.el, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      return null;
    }
  }
});
