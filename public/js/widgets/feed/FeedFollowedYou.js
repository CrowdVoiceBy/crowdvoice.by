var Person = require('./../../lib/currentPerson');

Class(CV, 'FeedFollowedYou').inherits(CV.FeedItem)({
  ELEMENT_CLASS: 'cv-feed-item',

  prototype: {
    /*@property {Object} FeedPresenter
     */
    data: null,

    init: function init(config) {
      CV.FeedItem.prototype.init.call(this, config);

      var textSuffix = ' followed you.';

      if (Person.is(this.data.entity.id) === false) {
        textSuffix = ' followed one of your organizations:';

        this.appendChild(new CV.CardMini({
          name: 'card',
          data: this.data.entity
        })).render(this.extraInfoElement);
      }

      this.updateAvatar();

      this.setText(this.constructor.stringLink({
        href: this.getProfileUrl(),
        text: this.getName()
      }) + textSuffix);
    },

    /* Creates the notification url that makes more sense to redirect when clicked.
     * @abstract
     */
    getLink: function getLink() {
      return this.getProfileUrl();
    }
  }
});
