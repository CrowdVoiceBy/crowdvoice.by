var moment = require('moment')
  , Events = require('./../../../../../lib/events');

Class(CV, 'PostCreatorFromSourcesSourceGoogleNewsItem').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'pcfs__google-news -rel',
  HTML: '\
    <article>\
      <div class="source-preview-wrapper">\
        <p class="source-title -font-bold -inline"></p>\
        <p class="source-date -inline"></p>\
        <div class="source-description -pt1"></div>\
      </div>\
      <div class="source-add-button -abs">\
        <button class="cv-button tiny">+ Add This</button>\
      </div>\
    </article>',

  prototype: {
    data: {
      title: '',
      description: '',
      date: '',
      sourceUrl: ''
    },
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
      this.dom.updateText(el.querySelector('.source-title'), this.data.title);
      this.dom.updateText(el.querySelector('.source-date'), moment(this.data.date).format('MMM, YYYY'));
      this.dom.updateHTML(el.querySelector('.source-description'), this.data.description);
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
