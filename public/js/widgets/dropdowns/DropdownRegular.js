var Events = require('./../../lib/events');

Class(CV.UI, 'DropdownRegular').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'ui-form-field',
  LABEL_HTML: '\
    <label class="-block">\
      <span class="ui-input__label -upper -font-bold"></span>\
      <span class="cv-caption"></span>\
    </label>',

  prototype: {
    data: {
      /* Form field label */
      label : '',
      /* Form field label caption */
      hint : '',
      /* Dropdown default label value */

      dropdownLabel : '',
      /* Array of options to be created
       * [{label: '', value: [any]}]
       */
      options : null
    },

    _items: null,
    _value: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      this.appendChild(new CV.Dropdown({
        name: 'dropdown',
        label: this.data.dropdownLabel || '',
        showArrow: true,
        className: this.data.className || 'ui-dropdown-styled -lg',
        arrowClassName: '-s10 -color-grey',
        bodyClassName: 'ui-vertical-list hoverable -block'
      })).render(this.el);

      this._setup()._bindEvents();
    },

    /* @method _setup <private>
    */
    _setup: function _setup() {
      if (this.data.label || this.data.hint) {
        this.el.insertAdjacentHTML('afterbegin', this.constructor.LABEL_HTML);
        this.dom.updateAttr('for', this.el.getElementsByTagName('label')[0], this._unique);
        this.labelElement = this.el.getElementsByClassName('ui-input__label')[0];
        this.hintElement = this.el.getElementsByClassName('cv-caption')[0];
        this.dom.updateText(this.labelElement, this.data.label);
        this.dom.updateText(this.hintElement, this.data.hint);
      }

      (this.data.options || []).forEach(function(option) {
        this._createOption(option.label, option.value);
      }, this);

      this._items = [].slice.call(this.dropdown.getContent());

      return this;
    },

    /* Creates a new option element.
     * @method _createOption <private>
     */
    _createOption: function _createOption(label, value) {
      var item = document.createElement('div')
        , span = document.createElement('span');
      item.className = 'ui-vertical-list-item';
      this.dom.updateAttr('data-value', item, value);
      this.dom.updateText(span, label);
      item.appendChild(span);
      this.dropdown.addContent(item);
    },

    _bindEvents: function _bindEvents() {
      this._clickHandlerRef = this._clickHandler.bind(this);
      this._items.forEach(function(item) {
        Events.on(item, 'click', this._clickHandlerRef);
      }, this);
      return this;
    },

    _clickHandler: function _clickHandler(ev) {
      this.selectByElement(ev.currentTarget);
    },

    /* Returns the data-value of the current selected option
     * @public
     */
    getValue: function getValue() {
      return this._value;
    },

    /* Activates an specific option element using its DOM reference,
     * updates the dropdown label equals to the option text and updates
     * the current selected value `this._value`
     * @public
     */
    selectByElement: function selectByElement(element) {
      this._value = element.dataset.value;
      this._items.forEach(function(item) {
        item.classList.remove('active');
      });
      element.classList.add('active');
      this.dropdown.setLabel(element.children[0].cloneNode(true)).deactivate();
    },

    selectByIndex: function selectByIndex(index) {
      this._items[index].click();
      return this;
    },

    /* Sets the error state on the dropdown.
     * @public
     */
    error: function error() {
      this.dropdown.error();
      return this;
    },

    disable: function disable() {
      Widget.prototype.disable.call(this);
      this.dropdown.disable();
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
