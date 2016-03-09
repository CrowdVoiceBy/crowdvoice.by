Class(CV, 'DiscoverRecommendedSectionItem').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'recommended-section-item',
  HTML: '\
    <div>\
      <p data-heading class="recommended-section-heading"></p>\
      <div data-container class="-rel"></div>\
    </div>',

  FOLLOWED_ENTITY_TEMPLATE: 'Because you followed <a href="{url}"><b>{fullname}</b></a>',
  FOLLOWED_VOICE_TEMPLATE: 'Because you followed <a href="{voice-url}"><b>{voice-name}</b></a> by <a href="{url}"><b>{fullname}</b></a>',

  prototype: {
    /* Holds the ResponsiveWidth instance reference.
     * @property _responsiveWidth <private>
     */
    _responsiveWidth : null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.headingElement = this.el.querySelector('[data-heading]');
      this.containerElement = this.el.querySelector('[data-container]');

      this._setup();
    },

    _setup: function _setup() {
      var template;

      if (this.data.type === 'voice') {
        template = this.constructor.FOLLOWED_VOICE_TEMPLATE;
        template = template.replace(/{url}/, '/' + this.data.owner.profileName + '/');
        template = template.replace(/{fullname}/, this.data.owner.name);
        template = template.replace(/{voice-url}/, '/' + this.data.owner.profileName + '/' + this.data.data.slug + '/');
        template = template.replace(/{voice-name}/, this.data.data.title);
        this.dom.updateHTML(this.headingElement, template);
      } else {
        template = this.constructor.FOLLOWED_ENTITY_TEMPLATE;
        template = template.replace(/{url}/, '/' + this.data.owner.profileName + '/');
        template = template.replace(/{fullname}/, this.data.owner.name);
        this.dom.updateHTML(this.headingElement, template);
      }
    },

    addVoices: function addVoices(voices) {
      var fragment = document.createDocumentFragment();
      this.containerElement.classList.add('responsive-width-voice-covers');

      voices.forEach(function(voice, index) {
        fragment.appendChild(this.appendChild(new CV.VoiceCover({
          name : 'voice_' + index,
          data : voice
        })).el);
      }, this);

      this._responsiveWidth = new CV.ResponsiveWidth({
        container : this.el,
        items : this.children.map(function(ch) {return ch.el;}),
        minWidth : 300
      }).setup();

      this.containerElement.appendChild(fragment);

      return this;
    },

    addCards: function addCards(entities) {
      var fragment = document.createDocumentFragment();
      this.containerElement.classList.add('responsive-width-cards');

      entities.forEach(function(user, index) {
        fragment.appendChild(this.appendChild(new CV.Card({
          name : 'entities_' + index,
          data : user
        })).el);
      }, this);

      this._responsiveWidth = new CV.ResponsiveWidth({
        container : this.el,
        items : this.children.map(function(ch) {return ch.el;}),
        minWidth : 300
      }).setup();

      this.containerElement.appendChild(fragment);

      return this;
    },

    update: function update() {
      this._responsiveWidth.update();
      return this;
    }
  }
});
