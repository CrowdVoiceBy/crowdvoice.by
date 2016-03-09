Class(CV, 'VoiceAddContent').inherits(Widget)({
  HTML: '\
    <div class="voice-add-content">\
      <button class="voice-add-post-button cv-button primary -m0 -p0 -rel">\
        <svg class="voice-add-post-button-svg -abs -color-white">\
          <use xlink:href="#svg-plus"></use>\
        </svg>\
      </button>\
    </div>',

  BUBBLE_OPTIONS : '\
    <div class="voice-add-content__option ui-vertical-list-item" data-type="FromUrl">\
      <svg class="voice-add-content__option-svg -s16 -color-grey-light">\
        <use xlink:href="#svg-link"></use>\
      </svg>\
      <span class="voice-add-content__option-label">From URL</span>\
      <span class="voice-add-content__option-tooltip ui-has-tooltip cv-caption -font-normal -color-neutral-mid">(?)\
        <i class="ui-tooltip -top-right">You can enter a URL of an image, video from Youtube or Vimeo or a web page.</i>\
      </span>\
    </div>\
    <div class="voice-add-content__option ui-vertical-list-item" data-type="FromSources">\
      <svg class="voice-add-content__option-svg -s16 -color-grey-light">\
        <use xlink:href="#svg-sources"></use>\
      </svg>\
      <span class="voice-add-content__option-label">Aggregator</span>\
      <span class="voice-add-content__option-tooltip ui-has-tooltip cv-caption -font-normal -color-neutral-mid">(?)\
        <i class="ui-tooltip -top-right">Insert keywords to generate and add relevant content from various sources.</i>\
      </span>\
    </div>\
    <div class="voice-add-content__option ui-vertical-list-item" data-type="UploadFile">\
      <svg class="voice-add-content__option-svg -s16 -color-grey-light">\
        <use xlink:href="#svg-upload"></use>\
      </svg>\
      <span class="voice-add-content__option-label">Upload Image</span>\
      <span class="voice-add-content__option-tooltip ui-has-tooltip cv-caption -font-normal -color-neutral-mid">(?)\
        <i class="ui-tooltip -top-right">Upload your own Images.</i>\
      </span>\
    </div>\
    <div class="voice-add-content__option ui-vertical-list-item" data-type="WriteArticle">\
      <svg class="voice-add-content__option-svg -s16 -color-grey-light">\
        <use xlink:href="#svg-pencil"></use>\
      </svg>\
      <span class="voice-add-content__option-label">Write Article</span>\
      <span class="voice-add-content__option-tooltip ui-has-tooltip cv-caption -font-normal -color-neutral-mid">(?)\
        <i class="ui-tooltip -top-right">Write and post your own article.</i>\
      </span>\
    </div>',

  prototype: {
    el: null,
    addPostButton: null,
    createPostModal : null,

    _bubbleActivateHandlerRef : null,
    _bubbleDeactivateHandlerRef : null,
    _createPostDeactivateHandlerRef : null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.addPostButton = this.el.querySelector('.voice-add-post-button');
      this._autoSetup()._bindEvents();
    },

    _autoSetup: function _autoSetup() {
      this.appendChild(new CV.PopoverBlocker({
        name: 'addPostBubble',
        className: 'voice-add-content-bubble',
        placement: 'top-right',
        toggler: this.addPostButton,
        content: this.constructor.BUBBLE_OPTIONS
      })).render(this.el);

      this.addPostBubble.getContent().className += ' ui-vertical-list hoverable';
      this.bubbleOptions = [].slice.call(this.addPostBubble.getContent().getElementsByClassName('voice-add-content__option'), 0);
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._bubbleActivateHandlerRef = this._bubbleActivateHandler.bind(this);
      this.addPostBubble.bind('activate', this._bubbleActivateHandlerRef);

      this._bubbleDeactivateHandlerRef = this._bubbleDeactivateHandler.bind(this);
      this.addPostBubble.bind('deactivate', this._bubbleDeactivateHandlerRef);

      this._optionClickHandlerRef = this._optionClickHandler.bind(this);
      this.bubbleOptions.forEach(function(option) {
        option.addEventListener('click', this._optionClickHandlerRef);
      }, this);

      return this;
    },

    /* Handle the actions when the bubble is activated.
     * @private
     */
    _bubbleActivateHandler: function _bubbleActivateHandler() {
      this.addPostButton.classList.add('active');
    },

    /* Handle the actions when the bubble is deactivated.
     * @private
     */
    _bubbleDeactivateHandler: function _bubbleDeactivateHandler() {
      this.addPostButton.classList.remove('active');
      if (this.createPostModal) {
        if (this.createPostModal.type === "UploadFile") {
            this.createPostModal.activate();
        } else {
          requestAnimationFrame(function () {
            this.createPostModal.activate();
          }.bind(this));
        }
      }
    },

    /* Handles the click event on a bubble menu option.
     * @private
     */
    _optionClickHandler: function _optionClickHandler(ev) {
      this.appendChild(CV.PostCreator.create({
        name: 'createPostModal',
        type: ev.currentTarget.getAttribute('data-type')
      })).render(document.body);
      this.addPostBubble.deactivate();

      this._createPostDeactivateHandlerRef = this._createPostDeactivateHandler.bind(this);
      this.createPostModal.bind('deactivate', this._createPostDeactivateHandlerRef);
    },

    _createPostDeactivateHandler: function _createPostDeactivateHandlerRef() {
      this.createPostModal.unbind('deactivate', this._createPostDeactivateHandlerRef);
      this._createPostDeactivateHandlerRef = null;
      this.createPostModal = this.createPostModal.destroy();
    },

    /* @override
     */
    destroy: function destroy() {
      this.addPostBubble.unbind('activate', this._bubbleActivateHandlerRef);
      this._bubbleActivateHandlerRef = null;

      this.addPostBubble.unbind('deactivate', this._bubbleDeactivateHandlerRef);
      this._bubbleDeactivateHandlerRef = null;

      this.bubbleOptions.forEach(function(option) {
        option.removeEventListener('click', this._optionClickHandlerRef);
      }, this);
      this._optionClickHandlerRef = null;

      Widget.prototype.destroy.call(this);

      return null;
    }
  }
});
