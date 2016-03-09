var moment = require('moment');

Class(CV, 'VoiceCoverMediumList').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'cv-voice-cover medium-list -clearfix',

  HTML: '\
    <article role="article">\
      <a href="#" class="voice-cover -img-cover -color-bg-neutral-x-light -float-left" data-voice-anchor></a>\
      <div class="voice-content -overflow-hidden">\
        <div class="author">\
          <a class="author-anchor -inline-block">\
            <img class="author-avatar -rounded">\
          </a>\
          by <a class="author-anchor -inline-block">\
            <span class="author-username">Noel Delgado</span>\
          </a>\
        </div>\
        <h2 class="voice-cover-title -font-bold">\
          <a class="voice-cover-title-anchor -tdn" data-voice-anchor href="">Voice Title</a>\
        </h2>\
        <p class="voice-cover-description">Voice Description</p>\
        <div class="meta">\
          <span class="voice-cover-followers voice-cover-meta">0 followers</span>\
          <span class="voice-cover-meta">\
            Updated <time class="voice-cover-datetime" datetime=""></time>\
          </span>\
        </div>\
      </div>\
    </article>',

  TAGS_HTLM: '<ul class="cv-tags voice-cover-meta -inline-block -list-horizontal"></ul>',

  TAG_ITEM_HTML : '\
    <li class="cv-tags-list-item">\
      <a class="cv-tags-tag"></a>\
    </li>',

  prototype: {
    /* @property {Object} data - VoiceEntity
     */
    data: {},

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.voiceAnchors = [].slice.call(this.el.querySelectorAll('[data-voice-anchor]'), 0);
      this.authorAnchors = [].slice.call(this.el.querySelectorAll('.author-anchor'), 0);

      this.authorAnchors.forEach(function(anchor) {
        window.CardHoverWidget.register(anchor, this.data.owner);
      }, this);

      this._setup();
    },

    _setup: function _setup() {
      var dateTimeElement = this.el.querySelector('.voice-cover-datetime');
      var authorAvatar = this.el.querySelector('.author-avatar');

      this.voiceAnchors.forEach(function(anchor) {
        this.dom.updateAttr('href', anchor, '/' + this.data.owner.profileName + '/' + this.data.slug + '/');
        this.dom.updateAttr('title', anchor, this.data.title + ' voice');
      }, this);

      if (this.data.images.card) {
        this.dom.updateBgImage(this.el.querySelector('.voice-cover'), this.data.images.card.url);
      } else {
        this.el.querySelector('.voice-cover').classList.add('-colored-background');
      }

      if (this.data.topics.length) {
        this._createTopics(this.data.topics);
      }

      this.authorAnchors.forEach(function(anchor) {
        if (this.data.owner.isAnonymous === true) {
          this.dom.renameNode(anchor, 'p');
        } else {
          this.dom.updateAttr('title', anchor, this.data.owner.name + '’s profile');
          this.dom.updateAttr('href', anchor, '/' + this.data.owner.profileName + '/');
        }
      }, this);
      this.dom.updateAttr('src', authorAvatar, this.data.owner.images.icon.url);
      this.dom.updateAttr('alt', authorAvatar, this.data.owner.name + '’s avatar image');
      this.dom.updateText(this.el.querySelector('.author-username'), this.data.owner.name);

      this.dom.updateText(this.el.querySelector('.voice-cover-title-anchor'), this.data.title);

      var description = this.format.truncate(this.data.description, this.constructor.MAX_DESCRIPTION_LENGTH, true);
      this.dom.updateText(this.el.querySelector('.voice-cover-description'), description);

      if (this.data.followers.length) {
        var followersString = this.format.numberUS(this.data.followers.length);
        if (this.data.followers.length > 1) {
          followersString += ' followers';
        } else {
          followersString += ' follower';
        }
        this.dom.updateText(this.el.querySelector('.voice-cover-followers'), followersString);
      } else {
        var followersElement = this.el.querySelector('.voice-cover-followers');
        followersElement.parentNode.removeChild(followersElement);
      }

      this.dom.updateText(dateTimeElement, moment(this.data.updatedAt).fromNow());
      this.dom.updateAttr('datetime', dateTimeElement, this.data.updatedAt);

      dateTimeElement = authorAvatar = null;
    },

    /**
     * Creates a tag per topic that is tagged to the topic and appends them.
     * @private
     * @param {object[]} topics - list of topics tagged to the voice
     * @return VoiceCoverMediumList
     */
    _createTopics: function _createTopics(topics) {
      this.el.querySelector('.meta').insertAdjacentHTML('afterbegin', this.constructor.TAGS_HTLM);
      this.tagListElement = this.el.querySelector('.cv-tags');

      topics.forEach(function(topic) {
        this.tagListElement.insertAdjacentHTML('beforeend', this.constructor.TAG_ITEM_HTML);
        var anchors = this.tagListElement.getElementsByClassName('cv-tags-tag');
        var anchor = anchors[anchors.length-1];

        this.dom.updateText(anchor, topic.name);
        this.dom.updateAttr('href', anchor, '/topic/' + topic.slug);
      }, this);

      return this;
    },

    destroy: function destroy() {
      this.authorAnchors.forEach(function(anchor) {
        window.CardHoverWidget.unregister(anchor);
      }, this);

      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
