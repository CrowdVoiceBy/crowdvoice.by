Class(CV, 'OrganizationProfileEditMembersList').inherits(Widget).includes(BubblingSupport)({
  prototype: {
    data: {
      members: null
    },

    init: function(config){
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup();
    },

    _setup: function _setup() {
      this.data.members.forEach(this.addUser, this);
      return this;
    },

    /* Appends a new listItem children.
     * @argument user <required> [EntityModel]
     * @return OrganizationProfileEditMembersList
     */
    addUser: function addUser(user) {
      this.appendChild(new CV.CardMini({
        name: 'user_' + user.id,
        className: 'cv-items-list',
        data: user
      })).render(this.el).addButtonAction({
        name: 'removeButton',
        value: 'Remove',
        className: 'micro',
        eventName: 'card-remove-action-clicked'
      });
      return this;
    },

    /* Removes a specific listItem.
     * @method removeUser <public> [Function]
     * @return OrganizationProfileEditMembersList
     */
    removeUser: function removeUser(user) {
      this.removeChild(user);
      user = user.destroy();
      return this;
    },

    /* Returns the total number of children, in this case the only children
     * this widget has are all listItems so we can rely on the children array
     * to return how many listItems it has, which can be trusted as the
     * number of members the organization has.
     * @method getTotalMembers <public> [Function]
     * @return this.children.length
     */
    getTotalMembers: function getTotalMembers() {
      return this.children.length;
    }
  }
});
