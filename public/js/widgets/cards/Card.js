var Person = require('./../../lib/currentPerson');
var Autolinker = require( 'autolinker' );

Class(CV, 'Card').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS : 'widget-card',
  HTML : '\
    <article role="article">\
      <div class="card-inner">\
        <a class="card_background-image-wrapper -img-cover -color-bg-neutral-x-light -text-center" data-user-anchor>\
          <img class="card_avatar -rounded -color-bg-neutral-x-light" alt="{{author.full_name}}’s avatar image"/>\
        </a>\
        <div class="card_info-wrapper">\
          <p class="card_username -rel -m0">\
            <a class="card_username-link" data-user-anchor></a>\
          </p>\
          <h3 class="card_fullname -rel -font-bold">\
            <a class="card_fullname-link -tdn" data-user-anchor></a>\
          </h3>\
          <div class="card_meta-location -nw -ellipsis">\
            <svg class="card_meta-svg"><use xlink:href="#svg-location"></use></svg>\
            <span class="card_meta-location-text"></span>\
          </div>\
          <p class="card_description"></p>\
          <div class="card_stats -rel">\
            <a class="card_stats-voice-count -tdn">0 Voices</a>\
          </div>\
        </div>\
      </div>\
    </article>',

  ACTIONS_HTML: '\
    <div class="card_actions">\
      <div class="-row -full-height"></div>\
    </div>',

  FOLLOWS_CURRENT_PERSON_TEMPLATE : '<span class="badge-follows card-follows-you">Follows You</span>',
  MAX_DESCRIPTION_LENGTH : 180,

  prototype : {
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
      this.locationEl = this.el.querySelector('.card_meta-location-text');
      this.totalVoices = this.el.querySelector('.card_stats-voice-count');

      this._setup();
      this._addActionButtons();
    },

    /**
     * Update its content with the received data.
     * @method _setup <private> [Function]
     * @return Card [Object]
     */
    _setup : function _setup() {
      this.userAnchors.forEach(function(anchor) {
        this.dom.updateAttr('href', anchor, '/' + this.data.profileName + '/');
        this.dom.updateAttr('title', anchor, this.data.name + '’s profile');
      }, this);

      if (this.data.backgrounds.card) {
        this.dom.updateBgImage(this.profileCoverEl, this.data.backgrounds.card.url);
      } else {
        this.profileCoverEl.classList.add('-colored-background');
      }

      this.dom.updateAttr('src', this.avatarEl, this.data.images.card.url);
      this.dom.updateAttr('alt', this.avatarEl, this.data.profileName + "’s avatar image");

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

      if (this.data.location) {
        this.dom.updateText(this.locationEl, 'from ' + this.data.location);
      } else {
        this.locationEl.parentNode.classList.add('-hide');
      }

      if (this.data.voicesCount) {
        this.dom.updateAttr('href', this.totalVoices, '/' + this.data.profileName + '/#voices');
        this.dom.updateAttr('title', this.totalVoices, this.data.voicesCount + ' voices');
        this.dom.updateText(this.totalVoices, this.data.voicesCount + ' Voices');
      } else {
        this.totalVoices.parentNode.removeChild(this.totalVoices);
      }

      return this;
    },

    /* Adds the necessary action buttons automatically - per user's role-based (follow, message, invite to, join, etc).
     * @method _addActionButtons <private> [Function]
     * @return CV.Card [Object]
     */
    _addActionButtons : function _addActionButtons() {
      if (!Person.get()) { return; }
      if (Person.is(this.data.id) || Person.anon()) { return; }

      this.el.querySelector('.card-inner').insertAdjacentHTML('beforeend', this.constructor.ACTIONS_HTML);
      var actionsEl = this.el.querySelector('.card_actions .-row');

      if (Person.ownerOf('organization', this.data.id) === false) {
        if (Person.get().ownedOrganizations.length === 0) {
          this.appendChild(new CV.CardActionFollow({
            name : 'followButton',
            entity :  this.data
          })).render(actionsEl);
        } else {
          this.appendChild(new CV.CardActionFollowMultiple({
            name : 'followButton',
            entity :  this.data
          })).render(actionsEl);
        }
        this._totalCountActions++;
      }

      if (this.data.type === "organization") {
        if (Person.memberOf('organization', this.data.id) === false) {
          this.appendChild(new CV.CardActionJoin({
            name : 'joinButton',
            entity : this.data
          })).render(actionsEl);
          this._totalCountActions++;
        }
      } else {
        this.appendChild(new CV.CardActionMessage({
          name : 'messageButton',
          id : this.data.id
        })).render(actionsEl);
        this._totalCountActions++;

        if (Person.canInviteEntity(this.data)) {
          this.appendChild(new CV.CardActionInvite({
            name : 'inviteButton',
            entity : this.data
          })).render(actionsEl);
          this._totalCountActions++;
        }
      }

      if (!this._totalCountActions) {
        this.el.querySelector('.card-inner').removeChild(this.el.querySelector('.card_actions'));
        return;
      }

      var n = 12 / this._totalCountActions;
      [].slice.call(this.el.querySelectorAll('.card-actions-item'), 0).forEach(function(item) {
        item.classList.add('-col-' + n);
      });

      this.el.classList.add('has-actions');

      return;
    }
  }
});
