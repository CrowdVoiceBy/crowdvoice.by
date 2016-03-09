var API = require('./../lib/api')
  , Person = require('./../lib/currentPerson')
  , Events = require('./../lib/events');

Class(CV.Views, 'PeopleFeed').includes(NodeSupport, CV.WidgetUtils)({
  prototype: {
    /* @property {Object} entity - currentEntity data
     * @property {string} entity.name
     * @property {string} entity.profileName
     */
    entity: null,

    _notificationsLimit: 10,
    _notificationsRequests: 0,
    _notificationsTotalCount: 0,

    init: function init(config) {
      Object.keys(config || {}).forEach(function(propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      this._notificationsTotalCount = this.totalFeedItems;
      this._window = window;
      this._body = document.body;
      this.profileBody = this.el.querySelector('.profile-body');

      this._setup();

      if (this.totalFeedItems === 0) {
        new CV.EmptyState({
          name: 'empty',
          className: '-pt4 -pb4',
          message: 'activity from voices and people you follow will appear here.'
        }).render(this.profileBody);
      } else {
        this._fetchItems()._bindEvents();
      }
    },

    _setup: function _setup() {
      if (Person.ownsOrganizations()) {
        this.dropdownContainer.innerHTML = '';
        this.dropdown = new CV.UI.PeopleFeedDropdown({
          name: 'dropdown'
        }).render(this.dropdownContainer);
        this.dropdown.selectByEntity(this.entity);
      }
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._scrollHandlerRef = this._scrollHandler.bind(this);
      Events.on(this._window, 'scroll', this._scrollHandlerRef);
    },

    _fetchItems: function _fetchItems() {
      if (this.children.length >= this._notificationsTotalCount) {
        return;
      }

      API.getFeed({
        profileName: this.entity.profileName,
        data: {
          limit: this._notificationsLimit,
          offset: this._notificationsRequests * this._notificationsLimit
        }
      }, this._itemsHandler.bind(this));

      return this;
    },

    _itemsHandler: function _itemsHandler(err, res) {
      var fragment = document.createDocumentFragment();

      this._notificationsRequests++;
      this._notificationsTotalCount = res.totalCount;

      res.feedItems.forEach(function (item, index) {
        this.appendChild(CV.FeedItem.create({
          name: 'feed-item__' + index,
          data: item
        })).render(fragment).showDate();
      }, this);
      this.profileBody.appendChild(fragment);
    },

    /* Handle the _window scroll event.
     * @private
     */
    _scrollHandler: function _scrollHandler(ev) {
      var el = ev.currentTarget;
      if ((el.scrollY + el.innerHeight) >= this._body.scrollHeight) {
        this._fetchItems();
      }
    }
  }
});
