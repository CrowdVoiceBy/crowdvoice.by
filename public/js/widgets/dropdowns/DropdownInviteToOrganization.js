var Person = require('./../../lib/currentPerson');

Class(CV.UI, 'DropdownInviteToOrganization').inherits(CV.UI.DropdownRegular)({
  prototype: {
    /* Entity Model to invite */
    entity: null,
    _items: null,

    /* Fill the dropdown options using currentPerson data. It will add currentPerson itself and
     * its owned organizations (if any).
     * @override
     */
    _setup: function _setup() {
      CV.UI.DropdownRegular.prototype._setup.call(this);

      var ownedOrganizations = Person.get('ownedOrganizations');
      if (ownedOrganizations) {
        ownedOrganizations.forEach(function(organization) {
          if (this.entity.organizationIds.indexOf(organization.id) === -1) {
            this.dropdown.addContent(this._createItem(organization, true));
          }
        }, this);
      }
      this._items = [].slice.call(this.dropdown.getContent());
      return this;
    },

    /* @override
     */
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
  }
});
