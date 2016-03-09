var API = require('./../../lib/api')
  , Person = require('./../../lib/currentPerson')
  , Events = require('./../../lib/events');

Class(CV, 'OrganizationProfileEditMembersTab').inherits(Widget)({
  ELEMENT_CLASS: 'organization-profile-members-tab',
  HTML: '\
    <div>\
      <div data-main></div>\
      <div data-list-wrapper>\
        <div class="form-field -mt2">\
          <label>\
            <b data-members-list-total>0</b> members of <b data-members-list-org-name>this organization</b>\
          </label>\
        </div>\
        <div>\
          <div data-members-list class="-rel"></div>\
        </div>\
      </div>\
    </div>',

  REMOVE_MEMBER_EVENT_NAME: 'card-remove-action-clicked',

  prototype: {
    data: {entity: null},

    /* Holds the data of the selected user.
    */
    _selectedUser: null,

    /* Array of current organization member ids.
     * Used to exclude current memebers and currentPerson from the search results.
     */
    _memeberIds: null,
    _flashMessage: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this._memeberIds = [];
      this.el = this.element[0];
      this.totalMemebersElement = this.el.querySelector('[data-members-list-total]');
      this.listElement = this.el.querySelector('[data-members-list]');

      this.appendChild(new CV.Loading({
        name: 'loader'
      })).render(this.listElement).center().setStyle({top: '80px'});

      this.appendChild(new CV.PopoverConfirm({
        name: 'confirmPopover',
        data: {
          confirm: {
            label: 'Remove',
            className: '-color-negative'
          }
        }
      }));

      this.appendChild(new CV.PopoverBlocker({
        name: 'popover',
        className: 'remove-item-popover',
        placement: 'top-right',
        content: this.confirmPopover.el
      }));

      this._setup()._bindEvents();
    },

    /* Creates and appends its children.
     * @return OrganizationProfileEditMembersTab
     */
    _setup: function _setup() {
      this.el.querySelector('[data-members-list-org-name]').textContent = this.data.entity.name;
      this._memeberIds.push(Person.get('id'));

      API.getOrganizationMembers({
        profileName: this.data.entity.profileName
      }, function(err,res) {
        res.forEach(function(member) {
          this._memeberIds.push(member.id);
        }, this);

        this.appendChild(new CV.OrganizationProfileEditMembersList({
          name: 'list',
          data: {
            members: res
          }
        })).render(this.listElement);

        this._updateListState();
        this.loader.disable().remove();
      }.bind(this));

      this.appendChild(new CV.UI.InputButton({
        name: 'searchInput',
        data: {label: 'Invite Users to Join ' + this.data.entity.name},
        inputData: {
          inputClassName: '-lg -block -btrr0 -bbrr0',
          attr: {
            placeholder: 'Search users...',
            autofocus: true
          }
        },
        buttonData: {
          value: 'Invite',
          className: 'primary'
        }
      })).render(this.el.querySelector('[data-main]')).button.disable();

      this.appendChild(new CV.UI.Input({
        name: 'messageInput',
        data: {
          label: 'Write a message',
          inputClassName: '-lg -block',
          isTextArea: true,
          attr: {
            rows: 2
          }
        }
      })).render(this.el.querySelector('[data-main]'));
      this.messageInput.setValue('Hey! We think you will be a valuable asset for our organization. Let’s rise our voice together!');

      return this;
    },

    /* Subscribe its events.
     * @method _bindEvents <private>
     * @return OrganizationProfileEditMembersTab
     */
    _bindEvents: function _bindEvents() {
      this._searchKeyUpHandlerRef = this._searchKeyUpHandler.bind(this);
      Events.on(this.searchInput.input.el, 'keyup', this._searchKeyUpHandlerRef);

      this._setSelectedUserRef = this._setSelectedUser.bind(this);
      this.searchInput.bind('results:item:clicked', this._setSelectedUserRef);

      this._inviteClickHandlerRef = this._inviteClickHandler.bind(this);
      Events.on(this.searchInput.button.el, 'click', this._inviteClickHandlerRef);

      this._removeMemberClickHandlerRef = this._removeMemberClickHandler.bind(this);
      this.bind(this.constructor.REMOVE_MEMBER_EVENT_NAME, this._removeMemberClickHandlerRef);

      this._popOverConfirmClickHandlerRef = this._popOverConfirmClickHandler.bind(this);
      this.confirmPopover.bind('confirm', this._popOverConfirmClickHandlerRef);

      this._popOverCancelClickHandlerRef = this._popOverCancelClickHandler.bind(this);
      this.confirmPopover.bind('cancel', this._popOverCancelClickHandlerRef);

      return this;
    },

    /* Updates the total memebers number.
     * Checks if the list has not members, in which case it will display the emptyState.
     * @method _updateListState <private> [Function]
     * @return undefined
     */
    _updateListState: function _updateListState() {
      var totalMemebers = this.list.getTotalMembers();

      this.totalMemebersElement.textContent = totalMemebers;

      if (totalMemebers === 0) {
        return this._showEmptyState();
      }

      if (this.empty) {
        this.empty = this.empty.destroy();
      }
    },

    /* Displays the EmptyState.
     * @method _showEmptyState <private> [Function]
     * @return undefined
     */
    _showEmptyState: function _showEmptyState() {
      if (this.empty) {
        return;
      }

      this.appendChild(new CV.EmptyState({
        name: 'empty',
        className: '-pt4 -pb4',
        message: '@' + this.data.entity.profileName + ' has no members yet.'
      })).render(this.listElement);
    },

    /* Search Input Key Up Handler. Checks if we should call the
     * searchPeople API endpoint.
     * @method _searchKeyUpHandler <private> [Function]
     */
    _searchKeyUpHandler: function  _searchKeyUpHandler(ev) {
      if (ev.which === 40 || ev.which === 38 || ev.which === 13) {
        return;
      }

      var searchString = ev.target.value.trim().toLocaleLowerCase();
      if (!searchString || (searchString.length < 2)) {
        return;
      }

      this.searchInput.button.disable();
      this._selectedUser = null;

      API.searchPeople({
        query: searchString,
        exclude: this._memeberIds
      }, this._searchUsersResponseHandler.bind(this));
    },

    /* Handles the searchUsers API response.
     * @method _searchUsersResponseHandler <private> [Function]
     * @return undefined
     */
    _searchUsersResponseHandler: function _searchUsersResponseHandler(err, res) {
      this.searchInput.results.deactivate().clear();

      if (!res.people.length) {
        return;
      }

      res.people.forEach(function(user) {
        this.searchInput.results.add({
          element: new CV.CardMiniClean({data: user}).el,
          data: user
        });
      }, this);

      this.searchInput.results.activate();
    },

    /* Sets the this._selectedUser data.
     * @method _setSelectedUser <private> [Function]
     * @return undefined
     */
    _setSelectedUser: function _setSelectedUser(ev) {
      this._selectedUser = ev.data;
      var userName = ev.data.name;

      this.searchInput.button.enable();
      this.searchInput.input.setValue(userName);
      this.searchInput.results.deactivate().clear();
    },

    /* Sends an invitation to _selectedUser to become a voice contributor.
     * @method _inviteClickHandler <private> [Function]
     * @return undefined
     */
    _inviteClickHandler: function _inviteClickHandler() {
      if (this.messageInput.getValue().trim().length === 0) {
        this.messageInput.error().getInput().focus();
        return;
      }

      this.searchInput.button.disable();

      if (!this._selectedUser) {
        return;
      }

      API.sendMessage({
        profileName: Person.get().profileName,
        data: {
          type: 'invitation_organization',
          senderEntityId: this.data.entity.id,
          receiverEntityId: this._selectedUser.id,
          organizationId: this.data.entity.id,
          message: this.messageInput.getValue()
        }
      }, this._inviteToContributeResponseHandler.bind(this));
    },

    /* Handles the inviteToContibute API response.
     * @method _inviteToContributeResponseHandler <private> [Function]
     * @return undefined
     */
    _inviteToContributeResponseHandler: function _inviteToContributeResponseHandler(err) {
      if (err) {
        this.searchInput.button.enable();
        return;
      }

      this.searchInput.input.setValue('');
      this.messageInput.setValue('');
      this._selectedUser = null;

      if (this._flashMessage) {
        return this._flashMessage.update({
          type: 'positive',
          text: "Invitation was sent, the user will see it on the message box."
        }).shake();
      }

      this.appendChild(new CV.Alert({
        name: '_flashMessage',
        type: 'positive',
        text: "Invitation was sent, the user will see it on the message box.",
        className: '-mb1'
      })).render(this.el, this.el.firstElementChild);
    },

    /* Handle the 'card-remove-action-clicked' event dispatched by `this.list`.
     * It will try to remove a specific entity from the organization.
     * @method _removeMemberClickHandler <private> [Function]
     * @return undefined
     */
    _removeMemberClickHandler: function _removeMemberClickHandler(ev) {
      ev.stopPropagation();
      this._currentOptionToRemove = ev.target;
      this._currentOptionToRemove.removeButton.disable();
      this.popover.render(this._currentOptionToRemove.removeButton.el).activate();
    },

    /* Handles the popover 'cancel' custom event.
     * Just close the popover.
     * @method _popOverCancelClickHandler <private> [Function]
     * @return undefined
     */
    _popOverCancelClickHandler: function _popOverCancelClickHandler(ev) {
      ev.stopPropagation();
      this.popover.deactivate();
      this._currentOptionToRemove.removeButton.enable();
    },

    /* Handles the popover 'confirm' custom event.
     * @method _popOverConfirmClickHandler <private> [Function]
     * @return undefined
     */
    _popOverConfirmClickHandler: function _popOverConfirmClickHandler(ev) {
      ev.stopPropagation();
      this.popover.deactivate();
      this._removeMember(this._currentOptionToRemove);
    },

    /* Tries to remove a specific entity from the organization.
     * @method _removeMember <private> [Function]
     * @argument widget <required> [EntityModel]
     * @return undefined
     */
    _removeMember: function _removeMember(entity) {
      API.removeEntityFromOrganization({
        profileName: this.data.entity.profileName,
        data: {
          entityId: entity.data.id,
          orgId: this.data.entity.id
        }
      }, this._removeContributorResponseHandler.bind(this, entity));
    },

    /* Handles the response of `API.removeEntityFromOrganization` call.
     * @method _removeContributorResponseHandler <private> [Function]
     * @return undefined
     */
    _removeContributorResponseHandler: function _removeContributorResponseHandler(widget, err) {
      if (err) {
        widget.removeButton.enable();
        return;
      }

      this.list.removeUser(widget);
      this._updateListState();
    }
  }
});
