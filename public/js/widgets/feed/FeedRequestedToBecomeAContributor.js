Class(CV, 'FeedRequestedToBecomeAContributor').inherits(CV.FeedItem)({
  ELEMENT_CLASS: 'cv-feed-item',

  prototype: {
    /*@property {Object} FeedPresenter
     */
    data: null,

    init: function init(config) {
      CV.FeedItem.prototype.init.call(this, config);

      this.updateAvatar();

      this.setText(this.constructor.stringLink({
        href: this.getProfileUrl(),
        text: this.getName()
      }) + ' requested to become a contributor of:');

      this.appendChild(new CV.VoiceCoverMini({
        name: 'voice-cover',
        data: this.data.voice
      })).render(this.extraInfoElement);
    },

    /* Creates the notification url that makes more sense to redirect when clicked.
     * @abstract
     */
    getLink: function getLink() {
      return this.getVoiceUrl();
    }
  }
});
