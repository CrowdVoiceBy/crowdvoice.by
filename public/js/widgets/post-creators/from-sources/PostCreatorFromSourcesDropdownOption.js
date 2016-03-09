Class(CV, 'PostCreatorFromSourcesDropdownOption').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'from-sources-dropdown-option',
  HTML: '\
    <div>\
      <div class="-overflow-hidden">\
        <p class="from-sources-dropdown-option-label -font-semi-bold"></p>\
        <p class="from-sources-dropdown-option-desc"></p>\
        <p class="from-sources-dropdown-option-help -color-neutral-mid"></p>\
      </div>\
    </div>',

  ICON_HTML: '\
    <svg class="from-sources-dropdown-option-svg -float-left -s20">\
      <use xlink:href="#svg-{{ICON_ID}}"></use>\
    </svg>',

  prototype: {
    /* The widget model data.
     * iconID
     * source
     * label
     * description
     * helpText
     */
    data: null,
    init: function init(config)  {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      if (this.data.iconID) {
        this.el.insertAdjacentHTML('afterbegin', this.constructor.ICON_HTML.replace(/{{ICON_ID}}/, this.data.iconID));
        this.iconElement = this.el.querySelector('.from-sources-dropdown-option-svg');
        if (this.data.iconClassName) this.iconElement.classList.add(this.data.iconClassName);
      }

      this.dom.updateText(this.el.querySelector('.from-sources-dropdown-option-label'), this.data.label);
      this.dom.updateText(this.el.querySelector('.from-sources-dropdown-option-desc'), this.data.description);
      this.dom.updateText(this.el.querySelector('.from-sources-dropdown-option-help'), this.data.helpText);

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      this.el.addEventListener('click', this._clickHandlerRef);
      return this;
    },

    _clickHandler: function _clickHandler() {
      this.dispatch('click');
    },

    getIcon: function getIcon() {
      return this.iconElement;
    },

    getSource: function getSource() {
      return this.data.source;
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      this.el.removeEventListener('click', this._clickHandlerRef);
      this._clickHandlerRef = null;
      return null;
    }
  }
});
