var Events = require('./../../lib/events');

Class(CV.UI, 'DropdownVoiceOwnership').inherits(Widget).includes(CV.WidgetUtils)({
  HTML: '\
    <div class="ui-form-field">\
      <label class="-block">\
        <span class="ui-input__label -upper -font-bold">Voice Ownership</span>\
      </label>\
    </div>',

  prototype: {
    /* Entity Model of the Voice Owner.
     * @property ownerEntity <required> [EntityModel]
     */
    ownerEntity: null,

    _items: null,
    _value: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);

      if (!this.ownerEntity) {
        throw new Error('Missing required prop. ownerEntity.');
      }

      this.el = this.element[0];

      this.appendChild(new CV.Dropdown({
        name: 'dropdown',
        label: '- Select voice ownership',
        showArrow: true,
        className: 'dropdown-voice-ownership ui-dropdown-styled -lg',
        arrowClassName: '-s10 -color-grey',
        bodyClassName: 'ui-vertical-list hoverable -block'
      })).render(this.el);

      this._setup()._bindEvents();
    },

    /* Fill the dropdown options using currentPerson data. It will add currentPerson itself and
     * its owned organizations (if any).
     * @method _setup <private>
     * @return DropdownVoiceOwnership
     */
    _setup: function _setup() {
      this.dropdown.addContent(this._createItem(this.ownerEntity, false));
      if (this.ownerEntity.ownedOrganizations) {
        this.ownerEntity.ownedOrganizations.forEach(function(organization) {
          this.dropdown.addContent(this._createItem(organization, true));
        }, this);
      }
      this._items = [].slice.call(this.dropdown.getContent());
      return this;
    },

    _createItem: function _createItem(entity, isOrganization) {
      var listElement = document.createElement('div');
      listElement.className = 'ui-vertical-list-item -p0';
      this.dom.updateAttr('data-value', listElement, entity.id);
      this.dom.updateAttr('data-is-organization', listElement, isOrganization);

      this.appendChild(new CV.CardUserSingleRow({
        name: 'item_' + entity.id,
        className: 'dropdown-voice-ownership__item',
        data: entity
      })).render(listElement);

      return listElement;
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      this._items.forEach(function(item) {
        Events.on(item, 'click', this._clickHandlerRef);
      }, this);
      return this;
    },

    _clickHandler: function _clickHandler(ev) {
      this.selectByElement(ev.currentTarget);
    },

    selectByElement: function selectByElement(element) {
      this._value = element.dataset.value;
      this._items.forEach(function(item) {
        item.classList.remove('active');
      });
      element.classList.add('active');
      this.dropdown.setLabel(element.children[0].cloneNode(true)).deactivate();
      this.dispatch('ownership:changed', {data: element});
    },

    selectByIndex: function selectByIndex(index) {
      this._items[index].click();
      return this;
    },

    selectByEntity: function selectByEntity(entity) {
      this._items.some(function(i) {
        if (i.getAttribute('data-value') === entity.id) {
          this.selectByElement(i);
          return true;
        }
      }, this);
      return this;
    },

    /* Returns the data-value of the current selected option
     * @method getValue <public>
     */
    getValue: function getValue() {
      return this._value;
    },

    /* Sets the error state on the dropdown.
     * @method error <public>
     */
    error: function error() {
      this.dropdown.error();
      return this;
    },

    disable: function disable() {
      Widget.prototype.disable.call(this);
      this.dropdown.disable();
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      this._items.forEach(function(item) {
        Events.off(item, 'click', this._clickHandlerRef);
      }, this);
      this._clickHandlerRef = null;
      return null;
    }
  }
});
