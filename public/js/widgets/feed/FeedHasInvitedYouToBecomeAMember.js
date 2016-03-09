var Person = require('./../../lib/currentPerson');

Class(CV, 'FeedHasInvitedYouToBecomeAMember').inherits(CV.FeedItem)({
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
      }) + ' has invited you to become a member of:');

      this.appendChild(new CV.CardMini({
        name: 'card',
        data: this.data.entity
      })).render(this.extraInfoElement);
    },

    /* Creates the notification url that makes more sense to redirect when clicked.
     * @abstract
     */
    getLink: function getLink() {
      return '/' + Person.get('profileName') + '/messages/';
    }
  }
});
