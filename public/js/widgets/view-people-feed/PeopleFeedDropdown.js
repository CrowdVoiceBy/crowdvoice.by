var Person = require('./../../lib/currentPerson')
  , Events = require('./../../lib/events');

Class(CV.UI, 'PeopleFeedDropdown').inherits(Widget).includes(CV.WidgetUtils)({
  prototype: {
    _items: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.appendChild(new CV.Dropdown({
        name: 'dropdown',
        showArrow: true,
        className: 'people-feed-dropdown',
        arrowClassName: '-s12',
        bodyClassName: 'ui-vertical-list hoverable -block',
        headClassName: 'h2',
      })).render(this.el);
      this._setup()._bindEvents();
    },

    selectByElement: function selectByElement(element) {
      this._items.forEach(function(item) {
        item.classList.remove('active');
      });
      element.classList.add('active');
      this.dropdown.setLabel(element.textContent).deactivate();
    },

    selectByEntity: function selectByEntity(entity) {
      this._items.some(function(i) {
        if (i.getAttribute('data-value') === entity.profileName) {
          this.selectByElement(i);
          return true;
        }
      }, this);
      return this;
    },

    /* Fill the dropdown options using currentPerson data. It will add
     * currentPerson itself and its owned organizations (if any).
     * @private
     * @return FeedDropdown
     */
    _setup: function _setup() {
      this._createItem(Person.get('name'), Person.get('profileName'));
      Person.get('ownedOrganizations').forEach(function(organization) {
        this._createItem(organization.name, organization.profileName);
      }, this);
      this._items = [].slice.call(this.dropdown.getContent());
      return this;
    },

    /* Creates a dropdown's option item.
     * @private
     * @return undefined
     */
    _createItem: function _createItem(label, value) {
      var item = document.createElement('div');
      item.className = 'ui-vertical-list-item';
      this.dom.updateText(item, label);
      this.dom.updateAttr('data-value', item, value);
      this.dropdown.addContent(item);
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      this._items.forEach(function(item) {
        Events.on(item, 'click', this._clickHandlerRef);
      }, this);
      return this;
    },

    _clickHandler: function _clickHandler(ev) {
      var target = ev.target;
      if (target.classList.contains('active') === false) {
        this.selectByElement(target);
        window.location = '/' + target.dataset.value + '/feed/';
      }
    }
  }
});
