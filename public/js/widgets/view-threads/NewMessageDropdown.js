var Person = require('./../../lib/currentPerson')
  , Events = require('./../../lib/events');

Class(CV.UI, 'NewMessageDropdown').inherits(Widget).includes(CV.WidgetUtils)({
  prototype: {
    _items: null,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.appendChild(new CV.Dropdown({
        name: 'dropdown',
        showArrow: true,
        className: 'new-message-dropdown ui-dropdown-styled -md',
        arrowClassName: '-s10 -color-grey',
        bodyClassName: 'ui-vertical-list hoverable -block'
      })).setLabel('<svg class="-color-primary -s16"><use xlink:href="#svg-new-message"></use></svg>');
      this.dropdown.render(this.element);

      this.dropdown.addContent(this._createItem(Person.get(), false));
      if (Person.ownsOrganizations()) {
        Person.get('ownedOrganizations').forEach(function(organization) {
          this.dropdown.addContent(this._createItem(organization, true));
        }, this);
      }
      this._items = [].slice.call(this.dropdown.getContent());
      this.dropdown.addContent('<p class="cv-caption -color-neutral-mid -pl1">Send message as:</p>', true);
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      this._items.forEach(function(item) {
        Events.on(item, 'click', this._clickHandlerRef);
      }, this);
      return this;
    },

    _clickHandler: function _clickHandler(ev) {
      this.dispatch('changed', {data: ev.currentTarget});
      this.dropdown.deactivate();
    },

    _createItem: function _createItem(entity, isOrganization) {
      var listElement = document.createElement('div');

      listElement.className = 'ui-vertical-list-item';
      this.dom.updateAttr('data-value', listElement, entity.id);
      this.dom.updateAttr('data-is-organization', listElement, isOrganization);

      this.appendChild(new CV.CardUserSingleRow({
        name: 'item_' + entity.id,
        labelClassName: '-ellipsis',
        data: entity
      })).render(listElement);

      return listElement;
    }
 }
});
