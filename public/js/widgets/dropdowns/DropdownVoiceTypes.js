var Events = require('./../../lib/events');

Class(CV.UI, 'DropdownVoiceTypes').inherits(Widget)({
  HTML: '\
    <div class="ui-form-field">\
      <label class="-block">\
        <span class="ui-input__label -upper -font-bold">Voice Type</span>\
      </label>\
    </div>',

  prototype: {
    _items: null,
    _value: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.appendChild(new CV.Dropdown({
        name: 'dropdown',
        label: '- Select the voice type',
        showArrow: true,
        className: 'dropdown-voice-types ui-dropdown-styled -lg',
        arrowClassName: '-s10 -color-grey',
        bodyClassName: 'ui-vertical-list hoverable -nw',
        content: '\
          <div class="ui-vertical-list-item" data-value="TYPE_PUBLIC" data-text="Open">\
            <p class="voice-types-item__title -font-bold">Open</p>\
            <p class="voice-types-item__subtitle">Anyone can post and moderate content.</p>\
          </div>\
          <div class="ui-vertical-list-item" data-value="TYPE_CLOSED" data-text="Close">\
            <p class="voice-types-item__title -font-bold">Closed</p>\
            <p class="voice-types-item__subtitle">Content Posting and moderation is only available upon invitation.</p>\
          </div>'
      })).render(this.el);

      this._items = [].slice.call(this.dropdown.getContent());

      return this;
    },

    /* Subscribe widget’s events.
     * @private
     */
    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      this._items.forEach(function(item) {
        Events.on(item, 'click', this._clickHandlerRef);
      }, this);
      return this;
    },

    /* Handle the dropdown items click.
     * @private
     */
    _clickHandler: function _clickHandler(ev) {
      this.selectByElement(ev.currentTarget);
    },

    /* Selects dropdown option by item element.
     * @public
     * @param {NodeElement} element - the dropdown option element to select.
     */
    selectByElement: function selectByElement(element) {
      this._value = element.dataset.value;
      this._items.forEach(function(item) {
        item.classList.remove('active');
      });
      element.classList.add('active');
      this.dropdown.setLabel(element.getAttribute('data-text')).deactivate();
      return this;
    },

    /* Selects dropdown option by item `data-value`.
     * @public
     * @param {string} value - the option’s data to be selected.
     */
    selectByValue: function selectByValue(value) {
      this._items.some(function(i) {
        if (i.getAttribute('data-value') === value) {
          this.selectByElement(i);
          return true;
        }
      }, this);
      return this;
    },

    /* Returns the `data-value` value of the current option selected.
     * @public
     */
    getValue: function getValue() {
      return this._value;
    },

    /* Sets the error state on the dropdown.
     * @public
     */
    error: function error() {
      this.dropdown.error();
      return this;
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      this._items.forEach(function(item) {
        Events.off(item, 'click', this._clickHandlerRef);
      }, this);
      this._clickHandlerRef = null;
      return null;
    }
  }
});
