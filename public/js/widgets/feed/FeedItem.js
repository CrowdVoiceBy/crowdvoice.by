var moment = require('moment');

Class(CV, 'FeedItem').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'cv-feed-item',
  HTML: '\
    <div>\
      <div class="cv-feed-item__info">\
        <div class="cv-feed-item__info-main">\
          <img class="main-avatar -rounded -color-bg-neutral-x-light"/>\
          <p class="main-text"></p>\
        </div>\
        <div class="cv-feed-item__info-extra"></div>\
      </div>\
    </div>',

  DATE_TEMPLATE: '<div class="cv-feed-item__time">{date}</div>',

  /* FeedItem factory.
   * @public|static
   * @return {Object} new FeedItem[type] instance.
   */
  create: function create(config) {
    var type = '';

    config.data.action.split(' ').forEach(function(term) {
      type += this.prototype.format.capitalizeFirstLetter(term);
    }, this);

    return new window.CV['Feed' + type](config);
  },

  /* Returns an anchor as string.
   * @protected|static
   * @example stringLink({href: '/', text: 'Sample Text'});
   * @return {srting} stringHTML
   */
  stringLink: function stringLink(config) {
    var string = '<a href="{href}">{text}</a>';

    Object.keys(config).forEach(function(propertyName) {
      var regEx = new RegExp('{' + propertyName + '}', 'gi');
      string = string.replace(regEx, config[propertyName]);
    }, this);

    return string;
  },

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.extraInfoElement = this.el.querySelector('.cv-feed-item__info-extra');
    },

    /* Creates the notification url that makes more sense to redirect when clicked.
     * All implementations should include this method.
     * @abstract
     */
    getLink: function getLink() {
      throw new Error('FeedItem.prototype.getLink not implemeted');
    },

    /* Displays the createdAt date at the top-right using moment's
     * fromNow method to format it.
     * @public
     * @return {Object} FeedItem
     */
    showDate: function showDate() {
      var timeFromNow = moment(this.data.createdAt).fromNow();
      var templateString = this.constructor.DATE_TEMPLATE.replace(/{date}/, timeFromNow);
      this.el.insertAdjacentHTML('beforeend', templateString);
      return this;
    },

    /* Returns the actionDoer name.
     * @protected
     * @return {string} name
     */
    getName: function getName() {
      return this.data.actionDoer.name;
    },

    /* Returns the actionDoer profile url.
     * @protected
     * @return {string}
     */
    getProfileUrl: function getProfileUrl() {
      return '/' + this.data.actionDoer.profileName + '/';
    },

    /* Returns the formated voice url.
     * @protected
     * @return {string}
     */
    getVoiceUrl: function getVoiceUrl() {
      var url = ''
        , voice = this.data.voice;
      if (voice) {
        url = '/' + voice.owner.profileName + '/' + voice.slug + '/';
      }
      return url;
    },

    /* Returns the actionDoer small avatar url.
     * @protected
     * @return {string} actionDoer small avatar url.
     */
    getAvatar: function getAvatar() {
      return this.data.actionDoer.images.notification.url;
    },

    /* Sets the actionDoer avatar.
     * @protected
     * @param {string} avatarPath - path to the avatar.
     * @return undefined
     */
    updateAvatar: function updateAvatar(avatarPath) {
      var path = this.getAvatar();
      var avatar = this.el.querySelector('.main-avatar');

      if (avatarPath) {
        path = avatarPath;
      }

      this.dom.updateAttr('src', avatar, path);
      this.dom.updateAttr('alt', avatar, this.getName());
    },

    /* Sets the description text.
     * @protected
     * @param {string} text
     * @return undefined
     */
    setText: function setText(text) {
      this.dom.updateHTML(this.el.querySelector('.main-text'), text);
    }
  }
});
