var moment = require('moment')
  , Events = require('./../../../../../lib/events');

Class(CV, 'PostCreatorFromSourcesSourceTwitterItem').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'pcfs__twitter -rel',
  HTML: '\
    <article>\
      <div class="source-preview-wrapper -clearfix">\
        <div class="-float-left -mr1">\
          <img class="source-preview-thumb" width="24" height="24"/>\
        </div>\
        <div class="-overflow-hidden">\
          <p class="source-title -font-bold -inline-block"></p>\
          <p class="pcfs-twitter-screen-name -inline-block"></p>\
          <p class="source-description"></p>\
          <p class="source-date -color-neutral-mid">\
            <svg class="-s14">\
              <use xlink:href="#svg-twitter-bird"></use>\
            </svg>\
            on <span class="pcfs-twitter-created-at"></span>\
          </p>\
        </div>\
      </div>\
      <div class="source-add-button -abs">\
        <button class="cv-button tiny">+ Add This</button>\
      </div>\
    </article>',

  prototype: {
    /* The tweet data.
     * @property {String} data.id_str - "692760085572030468"
     * @property {String} data.text - "Lorem ipsum..."
     * @property {Date} data.created_at - "Thu Jan 28 17:24:09 +0000 2016"
     * @property {Object} data.user
     * @property {String} data.user.name - "John Doe"
     * @property {String} data.user.screen_name - "johndoe"
     * @property {String} data.user.profile_image_url - "http://..."
     * ...
     */
    data: null,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      var el = this.element[0];
      this.addButton = el.querySelector('.source-add-button button');
      this.dom.updateAttr('src', el.querySelector('.source-preview-thumb'), this.data.user.profile_image_url);
      this.dom.updateText(el.querySelector('.source-title'), this.data.user.name);
      this.dom.updateText(el.querySelector('.pcfs-twitter-screen-name'), '@' + this.data.user.screen_name);
      this.dom.updateText(el.querySelector('.source-description'), this.data.text);
      this.dom.updateText(el.querySelector('.pcfs-twitter-created-at'), moment(this.data.date).format('MMM D, YYYY'));
      return this;
    },

    /* Subscribe wiget’s events
     * @private
     */
    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      Events.on(this.addButton, 'click', this._clickHandlerRef);
    },

    /* Handle the `add` button click event.
     * @private
     */
    _clickHandler: function _clickHandler() {
      CV[this.constructor.className].dispatch('addPost', {data: this});
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      Events.off(this.addButton, 'click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      return null;
    }
  }
});
