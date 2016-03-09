/* Class ManageContributors
 * Handles the Voice Contributors (search-people/add/remove) for a voice.
 * It should receive a `contributors` Array via data to display the current
 * contributors lists. That array will be passed to the ManageContributorsList
 * widget to render them.
 * This Widget also acts as a Controller because it will listen for when a
 * contributor gets removed and it will also handle when a new contributor gets
 * added.
 */
var Person = require('./../../../lib/currentPerson')
  , Events = require('./../../../lib/events')
  , API = require('./../../../lib/api')
  , GeminiScrollbar = require('gemini-scrollbar');

Class(CV, 'ManageContributors').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'cv-manage-contributors',
  HTML: '\
    <div>\
      <div data-main></div>\
      <div data-list-wrapper>\
        <div class="form-field -mt2">\
          <label>\
            <div data-contributors-count class="-inline-block">0</div> contributors of “<div class="-inline-block" data-voice-name>voice-name</div>”\
          </label>\
        </div>\
        <div>\
          <div class="cv-manage-contributors__list">\
            <div class="gm-scrollbar -vertical"><span class="thumb"></span></div>\
            <div class="gm-scrollbar -horizontal"><span class="thumb"></span></div>\
            <div data-contributors-list class="gm-scroll-view"></div>\
          </div>\
        </div>\
      </div>\
    </div>',

  REMOVE_CONTRIBUTOR_EVENT_NAME: 'card-remove-action-clicked',

  prototype: {
    data: {
      /* Current Voice Model.
       * @property voice <required> [Object]
       */
      voice: null,
      /* ContributorsEntities Models
       * @property contributors <required> [Array]
       */
      contributors: null
    },

    /* Holds the data of the selected user.
    */
    _selectedUser: null,

    /* Array of contributors ids (plus currentUser id).
     * Used to exclude this users from searchPeople results.
     * @private
     */
    _contributorIds: null,
    _contributorsLength: 0,

    _flashMessage: null,

    init: function(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.counterLabelElement = this.el.querySelector('[data-contributors-count]');
      this._setup()._bindEvents();
    },

    /* Initialilize the custom scrollbars.
     * @public
     */
    setup: function setup() {
      this.scrollbar = new GeminiScrollbar({
        element: this.el.querySelector('.cv-manage-contributors__list'),
        createElements: false
      }).create();
    },

    /* Creates and appends its children.
     * @return ManageRelatedVoices
     */
    _setup: function _setup() {
      if (!this.data.contributors) {
        throw Error('ManageContributors require data.contributors Array.');
      }

      this._contributorIds = this.data.contributors.map(function(user) {
        return user.id;
      });
      if (Person.get()) {
        this._contributorIds.push(Person.get().id);
      }
      this._contributorIds.push(this.data.voice.owner.id);

      this._contributorsLength = this.data.contributors.length;
      this.dom.updateText(this.el.querySelector('[data-voice-name]'), this.data.voice.title);
      this.dom.updateText(this.counterLabelElement, this._contributorsLength);

      this.appendChild(new CV.UI.InputButton({
        name: 'searchInput',
        data: {label: 'Invite Users to Contribute'},
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
      this.messageInput.setValue('Hey! Do you want to contribute to “' + this.data.voice.title + '”? Let’s rise our voice together!');

      this.appendChild(new CV.ManageContributorsList({
        name: 'list',
        data: {
          contributors: this.data.contributors
        }
      })).render(this.el.querySelector('[data-contributors-list]'));

      return this;
    },

    /* Subscribe its events.
     * @private
     * @return ManageContributors
     */
    _bindEvents: function _bindEvents() {
      this._searchKeyUpHandlerRef = this._searchKeyUpHandler.bind(this);
      Events.on(this.searchInput.input.el, 'keyup', this._searchKeyUpHandlerRef);

      this._setSelectedUserRef = this._setSelectedUser.bind(this);
      this.searchInput.bind('results:item:clicked', this._setSelectedUserRef);

      this._inviteClickHandlerRef = this._inviteClickHandler.bind(this);
      Events.on(this.searchInput.button.el, 'click', this._inviteClickHandlerRef);

      this._removeContributorRef = this._removeContributor.bind(this);
      this.bind(this.constructor.REMOVE_CONTRIBUTOR_EVENT_NAME, this._removeContributorRef);

      return this;
    },

    /* Search Input Key Up Handler. Checks if we should call the
     * searchPeople API endpoint.
     * @private
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
        exclude: this._contributorIds
      }, this._searchUsersResponseHandler.bind(this));
    },

    /* Handles the searchUsers API response.
     * @private
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
     * @private
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
     * @private
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
          type: 'invitation_voice',
          senderEntityId: this.data.voice.owner.id,
          receiverEntityId: this._selectedUser.id,
          voiceId: this.data.voice.id,
          message: this.messageInput.getValue()
        }
      }, this._inviteToContributeResponseHandler.bind(this));
    },

    /* Handles the inviteToContibute API response.
     * @private
     * @return undefined
     */
    _inviteToContributeResponseHandler: function _inviteToContributeResponseHandler(err) {
      if (err) {
        this.searchInput.button.enable();
        return;
      }

      this._contributorIds.push(this._selectedUser.id);
      this.searchInput.input.setValue('');
      this.messageInput.setValue('');
      this._selectedUser = null;

      if (this._flashMessage) {
        return this._flashMessage.update({
          type: 'positive',
          text: "Invitation was sent, the user will see it on the message box.",
        }).shake();
      }

      this.appendChild(new CV.Alert({
        name: '_flashMessage',
        type: 'positive',
        text: "Invitation was sent, the user will see it on the message box.",
        className: '-mb1'
      })).render(this.el, this.el.firstElementChild);
    },

    _removeContributor: function _removeContributor(ev) {
      ev.stopPropagation();

      var widget = ev.data;
      widget.removeButton.disable();

      API.voiceRemoveContributor({
        profileName: this.data.voice.owner.profileName,
        voiceSlug: this.data.voice.slug,
        data: {personId: widget.data.id}
      }, this._removeContributorResponseHandler.bind(this, widget));
    },

    _removeContributorResponseHandler: function _removeContributorResponseHandler(widget, err) {
      if (err) {
        widget.removeButton.enable();
        return;
      }

      var index = this._contributorIds.indexOf(widget.data.id);
      if (index > -1) {
        this._contributorIds.splice(index, 1);
      }
      this.list.removeUser(widget);
      this._contributorsLength--;
      this.dom.updateText(this.counterLabelElement, this._contributorsLength);
      this.scrollbar.update();

      this.dispatch('collaborator-removed');
    },

    destroy: function destroy() {
      if (this.scrollbar) {
        this.scrollbar = this.scrollbar.destroy();
      }

      if (this.searchInput) {
        Events.off(this.searchInput.input.el, 'keyup', this._searchKeyUpHandlerRef);
        this._searchKeyUpHandlerRef = null;

        Events.off(this.searchInput.button.el, 'click', this._inviteClickHandlerRef);
        this._inviteClickHandlerRef = null;
      }

      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
