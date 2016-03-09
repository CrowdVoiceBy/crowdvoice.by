/* globals App */
var origin = require('get-location-origin');
var Events = require('./../../lib/events');
var KEYS = require('./../../lib/keycodes');

Class(CV, 'PostDetail').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
  ELEMENT_CLASS : 'cv-post-detail',
  HTML : '\
    <div>\
      <header class="cv-post-detail__header -rel -clearfix">\
        <div class="pd-header-right-wrapper -float-right"></div>\
        <div class="pd-header__heading pd-header-left-wrapper -overflow-hidden">\
          <a target="_blank" title="CrowdVoice.by" class="pd-header-logo-wrapper -inline-block">\
            <svg class="header-logo__svg">\
              <use xlink:href="#svg-logo"></use>\
            </svg>\
          </a>\
          <div class="pd-header-meta -inline-block -overflow-hidden">\
            <p class="pd-header__title -font-bold"></p>\
            <p class="pd-header__author"></p>\
          </div>\
        </div>\
      </header>\
      <div class="cv-post-detail__content -clearfix -full-height"></div>\
    </div>',

  prototype : {
    /* @param config.data - PostInstance
    */
    init : function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.headerElement = this.el.querySelector('header');
      this.contentElement = this.el.querySelector('.cv-post-detail__content');
      this._window = window;

      this._setup()._bindEvents();
    },

    /* Add widget’s children and update static elements.
     * @private
     * @return {Object} this
     */
    _setup : function _setup() {
      this.dom.updateAttr('href', this.el.querySelector('.pd-header-logo-wrapper'), origin);
      this.dom.updateText(this.headerElement.querySelector('.pd-header__title'), this.data.voice.title);
      this.dom.updateText(this.headerElement.querySelector('.pd-header__author'), 'by ' + this.data.voice.owner.name);

      this.appendChild(new CV.UI.Close({
        name : 'closeButton',
        className : 'cv-post-detail__close-button',
        svgClassName : '-s14'
      })).render(this.el.querySelector('.pd-header-right-wrapper'));

      this.appendChild(new CV.PostDetailSidebar({
        name : 'sidebar',
        className : '-float-left'
      })).render(this.contentElement);

      this.appendChild(new CV.PostDetailInfo({
        name : 'info',
        className : '-overflow-hidden -full-height'
      })).render(this.contentElement);

      return this;
    },

    /* Subscribe general events shared by any PostDetail
     * @private
     */
    _bindEvents : function _bindEvents() {
      this._windowKeydownHandlerRef = this._windowKeydownHandler.bind(this);
      Events.on(this._window, 'keydown', this._windowKeydownHandlerRef);

      this._itemClickHandlerRef = this._itemClickHandler.bind(this);
      this.bind('sidebarItemClicked', this._itemClickHandlerRef);

      this._closeButtonClickHanderRef = this._closeButtonClickHander.bind(this);
      this.closeButton.bind('click', this._closeButtonClickHanderRef);

      return this;
    },

    /* Update the UI with a new image/video/article/text.
     * @param {Object} data - PostEntity
     */
    update : function update(data) {
      this.sidebar.activateItem(data);
      this.info.update(data);

      if (this.timeline) { this.timeline.update(data); }
    },

    /* Receives the new registered posts Array every time it gets updated
     * asynchronously via socket. This is useful, in this case, to keep
     * the thumbnail list update everytime more posts gets fetched.
     * @public
     */
    updatedPosts : function updatedPosts(posts) {
      this.sidebar.updateItems(posts);
      this.parent.update();
    },

    /* Sidebar item click handler.
     * @private
     */
    _itemClickHandler : function _itemClickHandler(ev) {
      ev.stopPropagation();
      this.parent.setIndexes(ev.data);
      this.update(ev.data);
    },

    /* Handles the click event on the close button
     * @private
     */
    _closeButtonClickHander : function _closeButtonClickHander() {
      this.deactivate();
    },

    /* Keydown handler.
     * @private
     */
    _windowKeydownHandler : function _windowKeydownHandler(ev) {
      var charCode = (typeof ev.which === 'number') ? ev.which : ev.keyCode;
      if (charCode === KEYS.ESC) {
        this.deactivate();
      }
    },

    /* @override
    */
    _activate : function _activate() {
      Widget.prototype._activate.call(this);
      App.hideScrollbar();
    },

    /* @override
    */
    _deactivate : function _deactivate() {
      Widget.prototype._deactivate.call(this);
      App.showScrollbar();
    },

    /* @override
    */
    destroy : function destroy() {
      Widget.prototype.destroy.call(this);
      Events.off(this._window, 'keydown', this._windowKeydownHandlerRef);
      this._windowKeydownHandlerRef = null;
      return null;
    }
  }
});
