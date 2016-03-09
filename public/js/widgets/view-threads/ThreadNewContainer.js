var Person = require('../../lib/currentPerson')
  , Events = require('../../lib/events')
  , API = require('../../lib/api')
  , KEYCODES = require('../../lib/keycodes');

Class(CV, 'ThreadNewContainer').inherits(Widget).includes(CV.WidgetUtils)({
  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.senderNameLabelElement = this.el.querySelector('.js-m-new__label-sender');
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.appendChild(new CV.UI.InputButton({
        name: 'searchInput',
        inputData: {
          inputClassName: '-md -block -pl0',
          attr: {
            placeholder: 'Type name...',
            autofocus: true
          }
        },
      })).render(this.el.querySelector('.new-thread-message-element__header__search-input')).button.destroy();

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._searchKeyUpHandlerRef = this._searchKeyUpHandler.bind(this);
      Events.on(this.searchInput.input.el, 'keyup', this._searchKeyUpHandlerRef);

      this._setSelectedUserRef = this._setSelectedUser.bind(this);
      this.searchInput.bind('results:item:clicked', this._setSelectedUserRef);
    },

    updateSenderLabel: function updateSenderLabel(label) {
      this.dom.updateText(this.senderNameLabelElement, label);
      return this;
    },

    focus: function focus() {
      this.searchInput.input.getInput().focus();
      return this;
    },

    /* Search Input Key Up Handler. Checks if we should call the
     * searchPeople API endpoint.
     */
    _searchKeyUpHandler: function  _searchKeyUpHandler(ev) {
      if (ev.which === KEYCODES.KEYDOWN || ev.which === KEYCODES.KEYUP || ev.which === KEYCODES.ENTER) {
        return;
      }

      var searchString = ev.target.value.trim().toLowerCase();
      if (!searchString || searchString.length < 2) {
        return this.searchInput.results.deactivate();
      }

      API.searchPeopleToInvite({
        profileName: Person.get('profileName'),
        data : {query: ev.target.value}
      }, this._searchUsersResponseHandler.bind(this));
    },

    /* Handles the searchUsers API response.
     */
    _searchUsersResponseHandler: function _searchUsersResponseHandler(err, res) {
      this.searchInput.results.deactivate().clear();

      if (!res.length) return;

      res.map(function(user) {
        if (user.isAnonymous === true) return;
        this.searchInput.results.add({
          element: new CV.CardMiniClean({data: user}).el,
          data: user
        });
      }, this);

      this.searchInput.results.activate();
    },

    /* Sets the this._selectedUser data.
     */
    _setSelectedUser: function _setSelectedUser(ev) {
      this.searchInput.input.setValue('');
      this.searchInput.results.deactivate().clear();
      this.parent.dispatch('composeMessageSetReceiver', {entity: ev.data});
    },
  }
});
