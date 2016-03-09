Class(CV, 'VoicePublishOnboardingManager').includes(NodeSupport)({
  prototype: {
    publishButtonWrapper: null,
    voiceData: null,
    init: function init(config) {
      Object.keys(config).forEach(function (propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      this._setup();
    },

    _setup: function _setup() {
      if (this._canPublishVoice()) {
        this.appendChild(new CV.PopoverBlocker({
          name: 'popover',
          className: 'popover__voice-onboarding -text-left',
          placement: 'bottom-left',
          title: 'You’re ready to publish!',
          content: CV.VoicePublishOnboardingCan,
          data: {voice: this.voiceData},
          showCloseButton: true
        })).render(this.publishButtonWrapper);
      } else {
        this.appendChild(new CV.PopoverBlocker({
          name: 'popover',
          className: 'popover__voice-onboarding -text-left',
          placement: 'bottom-left',
          title: 'You can’t publish this yet!',
          content: CV.VoicePublishOnboardingCannot,
          data: {voice: this.voiceData},
          showCloseButton: true
        })).render(this.publishButtonWrapper);
      }
    },

    _canPublishVoice: function _canPublishVoice() {
      return ((this.voiceData.postsCount >= 20) && (Object.keys(this.voiceData.images).length >= 1));
    },

    showOnboarding: function showOnboarding() {
      this.popover.activate();
      return this;
    }
  }
});
