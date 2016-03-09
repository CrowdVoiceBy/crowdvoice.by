var Person = require('../../lib/currentPerson')
  , API = require('../../lib/api')
  , Events = require('../../lib/events');

Class(CV, 'ThreadSidebarItem').inherits(Widget).includes(CV.WidgetUtils)({
  HTML: '\
    <div class="thread-list-item -rel -clickable -clearfix">\
      <img class="thread-list-item__avatar-partner -color-bg-neutral-x-light -abs">\
      <img class="thread-list-item__avatar-sender -color-bg-neutral-x-light -abs">\
      <div class="message-info">\
        <p class="-font-normal -ellipsis">\
          <span class="thread-list-item__partner-name"></span>\
          <span class="thread-list-item__as -color-neutral-mid"></span>\
        </p>\
        <p class="thread-list-item__last-message -ellipsis"></p>\
      </div>\
    </div>',

  prototype: {
    /* @property {object} data ThreadPresenter
     */
    data: null,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.lastMessageElement = this.element[0].querySelector('.thread-list-item__last-message');
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.threadPartner = this.data.senderEntity;
      this.threadSender = this.data.receiverEntity;

      this.appendChild(new CV.UI.Badge({
        name: 'badge',
        className: '-abs'
      })).setStyle({
        top: '20px', right: '30px'
      }).render(this.element).deactivate();

      if ((Person.is(this.data.senderEntity.id)) ||
          (Person.ownerOf('organization', this.data.senderEntity.id))) {
        this.threadPartner = this.data.receiverEntity;
        this.threadSender = this.data.senderEntity;
      }

      this.element.find('.thread-list-item__partner-name').text(this.threadPartner.name);
      this.element.find('.thread-list-item__avatar-partner').attr('src', this.threadPartner.images.small.url);

      if (this.threadSender.type === "person") {
        this.element.find('.thread-list-item__avatar-sender').remove();
        this.element.find('.thread-list-item__as').text('(As Myself)');
      } else {
        this.element.find('.thread-list-item__avatar-sender').attr('src', this.threadSender.images.notification.url);
        this.element.find('.thread-list-item__as').text('(As '+ this.threadSender.name +')');
      }

      this.updateLastMessage(this.data.latestMessageContent);

      if (this.data.unreadCount) {
        this._updateUnreadCounter();
      }

      return this;
    },

    /* Subscribe widget’s events.
     */
    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.element[0], 'click', this._clickHandlerRef);
      return this;
    },

    /* Sidebar thread item click handler.
     */
    _clickHandler: function _clickHandler() {
      CV.ThreadSidebarItem.dispatch('sidebarItem:click', {widget: this});
    },

    /* Updates the last message preview on the sidebar thread item.
     * @public
     */
    updateLastMessage: function updateLastMessage(message) {
      this.dom.updateText(this.lastMessageElement, message);
      return this;
    },

    _updateUnreadCounter: function _updateUnreadCounter() {
      this.badge.setValue(this.data.unreadCount).activate();
    },

    /* Increate the unreadCount property, set the unreadCount value to the
     * badge and show the badge.
     * @public
     */
    updateUnreadCounter: function updateUnreadCounter() {
      this.data.unreadCount++;
      this._updateUnreadCounter();
      return this;
    },

    /* Mark the conversation as read.
     * @public
     */
    markAsRead: function markAsRead(callback) {
      API.markThreadMessagesAsRead({
        profileName: Person.get('profileName'),
        threadId: this.data.id
      }, function (err, res) {
        if (typeof callback === 'function') callback(err, res);
      });
      return this;
    },

    _activate: function _activate() {
      Widget.prototype._activate.call(this);
      this.badge.deactivate();
      this.data.unreadCount = 0;
      this.markAsRead();
    }
  }
});
