Class(CV, 'EmbedHeader').inherits(Widget).includes(BubblingSupport)({
  prototype : {
    /**
     * @param {Object} config - the configuration object
     * @property {HTMLElement} el - the element to append each one of the layers.
     * @property {Object} config.voiceData - the active voice data passed through the VoicesPresenter.
     * @property {Object} config.reqQuery - the widget configurations initially passed as url params but cleaned by the server.
     * @property {Number} config.totalPosts - the total number of posts for the current Voice.
     */
    init : function init (config) {
      Widget.prototype.init.call(this, config);
      this.rightWrapperElement = this.el.querySelector('.header-right-wrapper');

      this._setup();
    },

    /* Initialize its children widgets based on the embeddable widget settings.
     * @private
     */
    _setup : function _setup () {
      this.el.querySelector('[data-total-posts]').textContent = this.totalPosts;

      this.appendChild(new CV.VoiceFilterPostsDropdown({
        name: 'filterDropdown',
        className: 'header-filter-posts-dropdown -inline-block',
        dropdownClassName: (this.reqQuery.theme === 'dark') ? 'grey' : this.reqQuery.theme
      })).render(this.rightWrapperElement);

      if (this.reqQuery.change_view) {
        this.appendChild(new CV.EmbedHeaderViewButtons({
          name: 'viewButtons',
          className: 'header-switch-view-buttons-group',
          defaultView: this.reqQuery.default_view,
          theme: (this.reqQuery.theme === 'dark') ? 'grey' : this.reqQuery.theme
        })).render(this.rightWrapperElement);
      }

      if (this.reqQuery.share) {
        this.appendChild(new CV.EmbedHeaderShareButton({
          name: 'shareButton',
          className: '-inline-block',
          theme: (this.reqQuery.theme === 'dark') ? 'grey' : this.reqQuery.theme,
          voiceData: this.voiceData
        })).render(this.rightWrapperElement);
      }

      if (this.voiceData.type === 'TYPE_PUBLIC') {
        this.appendChild(new CV.EmbedOpenVoiceButton({
          name: 'openVoiceButton',
          accent: this.reqQuery.accent,
          voiceData: this.voiceData
        })).render(this.rightWrapperElement);
      }
    }
  }
});
