var moment = require('moment')
  , Events = require('./../../../../../lib/events');

Class(CV, 'PostCreatorFromSourcesSourceYoutubeItem').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'pcfs__youtube -rel',
  HTML: '\
    <article>\
      <div class="source-preview-wrapper -clearfix">\
        <div class="-float-left -mr1">\
          <img class="source-preview-thumb" width="100" height="56"/>\
        </div>\
        <div class="-overflow-hidden">\
          <p class="source-title -font-bold -inline"></p>\
          <p class="source-date -color-neutral-mid -inline"></p>\
          <p class="source-description"></p>\
        </div>\
      </div>\
      <div class="source-add-button -abs">\
        <button class="cv-button tiny">+ Add This</button>\
      </div>\
    </article>',

  prototype: {
    /* The item data to be rendered.
     * @property {String} data.date - published video date. @example "2012-10-18T07:57:11.000Z"
     * @property {String} data.description - video’s description.
     * @property {String} data.sourceUrl - video’s full url.
     * @property {String} data.title - video’s title
     * @property {Object} data.thumb - videos’s thumbnail.
     * @property {Number} data.thumb.height
     * @property {Number} data.thumb.width
     * @property {String} data.thumb.url
     */
    data: null,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this._setup()._bindEvents();
    },

    /* Update initial widget state.
     * @private
     * @return {Object} this
     */
    _setup: function _setup() {
      var el = this.element[0];
      this.addButton = el.querySelector('.source-add-button button');
      this.dom.updateAttr('src', el.querySelector('.source-preview-thumb'), this.data.thumb.url);
      this.dom.updateText(el.querySelector('.source-title'), this.data.title);
      this.dom.updateText(el.querySelector('.source-date'), moment(this.data.date).format('MMM, YYYY'));
      this.dom.updateText(el.querySelector('.source-description'), this.data.description);
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
