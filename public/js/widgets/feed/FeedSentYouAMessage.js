var Person = require('./../../lib/currentPerson');

Class(CV, 'FeedSentYouAMessage').inherits(CV.FeedItem)({
  ELEMENT_CLASS: 'cv-feed-item message',

  prototype: {
    /*@property {Object} FeedPresenter
     */
    data: null,

    init: function init(config) {
      CV.FeedItem.prototype.init.call(this, config);

      this.updateAvatar();
      this.setText('Message from ' + this.constructor.stringLink({
        href: this.getProfileUrl(),
        text: this.getName()
      }) + ':');

      this.dom.addClass(this.extraInfoElement, ['-ellipsis']);
      this.dom.updateText(this.extraInfoElement,
        this.data.thread.messages.map(function(message) {
          return message.message;
        }).join(' ')
      );
    },

    /* Creates the notification url that makes more sense to redirect when clicked.
     * @abstract
     */
    getLink: function getLink() {
      return '/' + Person.get('profileName') + '/messages/#' + this.data.thread.messages[0].threadId;
    }
  }
});
