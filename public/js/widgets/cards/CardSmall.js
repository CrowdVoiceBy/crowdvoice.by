var Person = require('./../../lib/currentPerson')
  , PLACEHOLDERS = require('./../../lib/placeholders')
  , Autolinker = require( 'autolinker' );

Class(CV, 'CardSmall').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
  ELEMENT_CLASS: 'widget-card card-small',
  HTML: '\
    <article role="article">\
      <div class="card-inner">\
        <a class="card_background-image-wrapper -img-cover -text-center" data-user-anchor>\
          <img class="card_avatar -rounded" alt="{{author.full_name}}’s avatar image"/>\
        </a>\
        <div class="card_info-wrapper">\
          <p class="card_username -rel">\
            <a class="card_username-link" data-user-anchor></a>\
          </p>\
          <h3 class="card_fullname -rel -font-bold">\
            <a class="card_fullname-link -tdn" data-user-anchor></a>\
          </h3>\
          <p class="card_description"></p>\
          <div class="card_stats -rel">\
            <a class="card_stats-voice-count -tdn">0 Voices</a>\
          </div>\
        </div>\
        <div class="card_actions">\
          <div class="-row -full-height"></div>\
        </div>\
      </div>\
    </article>',

  FOLLOWS_CURRENT_PERSON_TEMPLATE: '<span class="badge-follows card-follows-you">Follows You</span>',
  MAX_DESCRIPTION_LENGTH: 180,

  prototype: {
    followersCount : 0,
    followingCount : 0,
    voicesCount : 0,
    membershipCount : 0,
    /* is currentPerson following this entity? */
    followed : false,

    _totalCountActions : 0,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      this.userAnchors = [].slice.call(this.el.querySelectorAll('[data-user-anchor]'), 0);
      this.profileCoverEl = this.el.querySelector('.card_background-image-wrapper');
      this.avatarEl = this.el.querySelector('.card_avatar');
      this.statsWrapper = this.el.querySelector('.card_stats');
      this.descriptionEl = this.el.querySelector('.card_description');
      this.totalVoices = this.el.querySelector('.card_stats-voice-count');
      this.actionsEl = this.el.querySelector('.card_actions .-row');

      this._setup();
      this._addActionButtons();
    },

    /* Adds the necessary action buttons automatically - per user's role-based (follow, message, invite to, join, etc).
     * @method _addActionButtons <private> [Function]
     * @return CV.Card [Object]
     */
    _addActionButtons: function _addActionButtons() {
      if (!Person.get()) { return; }
      if (Person.is(this.data.id) || Person.anon()) { return; }

      if (this.data.type === "organization") {
        if (Person.ownerOf('organization', this.data.id) === true) {
          return;
        }
      }

      if (Person.get().ownedOrganizations.length === 0) {
        this.appendChild(new CV.CardActionFollow({
          name: 'followButton',
          entity:  this.data
        })).render(this.actionsEl);
      } else {
        this.appendChild(new CV.CardActionFollowMultiple({
          name: 'followButton',
          entity:  this.data,
          followingAsText: 'Following...'
        })).render(this.actionsEl);
      }
      this._totalCountActions++;

      if (this.data.type === "organization") {
        this.appendChild(new CV.CardActionJoin({
          name: 'joinButton',
          entity: this.data
        })).render(this.actionsEl);
        this._totalCountActions++;
      } else {
        this.appendChild(new CV.CardActionMessage({
          name: 'messageButton',
          id: this.data.id
        })).render(this.actionsEl);
        this._totalCountActions++;

        if (Person.canInviteEntity(this.data)) {
          this.appendChild(new CV.CardActionInvite({
            name: 'inviteButton',
            entity: this.data
          })).render(this.actionsEl);
          this._totalCountActions++;
        }
      }

      var n = 12 / this._totalCountActions;
      [].slice.call(this.el.querySelectorAll('.card-actions-item'), 0).forEach(function(item) {
        item.classList.add('-col-' + n);
      });

      this.el.classList.add('has-actions');

      return this;
    },

    /**
     * Update its content with the received data.
     * @method _setup <private> [Function]
     * @return Card [Object]
     */
    _setup: function _setup() {
      this.userAnchors.forEach(function(anchor) {
        this.dom.updateAttr('href', anchor, '/' + this.data.profileName + '/');
        this.dom.updateAttr('title', anchor, this.data.name + '’s profile');
      }, this);

      if (this.data.backgrounds.bluredCard) {
        this.dom.updateBgImage(this.profileCoverEl, this.data.backgrounds.bluredCard.url);
      } else {
        this.profileCoverEl.classList.add('-colored-background');
      }

      if (this.data.images.card && this.data.images.card.url) {
        this.dom.updateAttr('src', this.avatarEl, this.data.images.card.url);
        this.dom.updateAttr('alt', this.avatarEl, this.data.profileName + "’s avatar image");
      } else {
        this.dom.updateAttr('src', this.avatarEl, PLACEHOLDERS.card);
      }

      this.dom.updateText(this.el.querySelector('.card_username-link'), "@" + this.data.profileName);

      if (this.data.followsCurrentPerson) {
        this.el.querySelector('.card_username').insertAdjacentHTML('beforeend', this.constructor.FOLLOWS_CURRENT_PERSON_TEMPLATE);
      }

      this.dom.updateText(this.el.querySelector('.card_fullname-link'), this.data.name);

      var description = Autolinker.link(this.format.truncate(this.data.description || '', this.constructor.MAX_DESCRIPTION_LENGTH, true));
      if (description != null){
        this.dom.updateHTML(this.descriptionEl, description);
      } else {
        this.dom.updateHTML(this.descriptionEl, "");
      }

      this.dom.updateAttr('href', this.totalVoices, '/' + this.data.profileName + '/#voices');
      this.dom.updateAttr('title', this.totalVoices, this.data.voicesCount + ' voices');
      this.dom.updateText(this.totalVoices, this.data.voicesCount + ' Voices');

      return this;
    }
  }
});
