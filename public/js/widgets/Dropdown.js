/* Class CV.Dropdown
 * The dropdown class require the following options to work:
 * - label (string | Node/s)
 * - content (string | Node/s)
 *
 * This dropdown only does the following:
 * - show the `body` when the `head` is clicked
 * - when an clicking outside of the dropdown, the `body` will hide
 *
 * You can also call the `activate` and `deactivate` methods on the dropdown instance to show and hide the `body` as well.
 * To set the contents you can use the `setContent` method, which will replace the contents,
 * or you can append elements to it using the `addContent` method.
 */
var Events = require('./../lib/events');

Class(CV, 'Dropdown').inherits(Widget).includes(CV.WidgetUtils)({
  HTML: '\
    <div class="ui-dropdown -rel">\
      <div class="ui-dropdown__head -full-height -clickable">\
        <div class="ui-dropdown-label"></div>\
      </div>\
      <div class="ui-dropdown__body -abs"></div>\
    </div>',

  HTML_LABEL: '<div class="ui-dropdown-label"></div>',

  ARROW_HTML: '\
    <svg class="ui-dropdown-arrow">\
      <use xlink:href="#svg-arrow-down"></use>\
    </svg>',

  prototype : {
    /* options */
    label: '',
    content: '',
    alignment: 'left',
    showArrow: true,
    arrowClassName: '',
    headClassName: '',
    bodyClassName: '',

    /* private */
    el: null,
    head: null,
    body: null,
    labelElement: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.head = this.el.querySelector('.ui-dropdown__head');
      this.body = this.el.querySelector('.ui-dropdown__body');
      this.labelElement = this.el.querySelector('.ui-dropdown-label');
      this._document = document;
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.el.classList.add('-' + this.alignment);
      this.setLabel(this.label);
      this.setContent(this.content);

      if (this.showArrow) {
        var arrow = this.constructor.ARROW_HTML;

        if (this.alignment === 'top') {
          arrow = arrow.replace(/arrow-down/, 'arrow-up');
        }

        this.head.insertAdjacentHTML('beforeend', arrow);
        this.dom.addClass(this.el, ['has-arrow']);

        if (this.arrowClassName) {
          this.arrowElement = this.head.querySelector('.ui-dropdown-arrow');
          this.dom.addClass(this.arrowElement, this.arrowClassName.split(/\s/));
        }
      }

      this.head.className += ' ' + this.headClassName;
      this.body.className += ' ' + this.bodyClassName;

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._toggleRef = this.toggle.bind(this);
      this._documentClickHandlerRef = this._documentClickHandler.bind(this);
      Events.on(this.head, 'click', this._toggleRef);
    },

    /* Replace the label with the passed HTMLString, String, or HTMLElement(s).
     * @public
     */
    setLabel: function setLabel(label) {
      this.labelElement.innerHTML = '';

      if ((typeof label).toLowerCase() === 'string') {
        this.labelElement.insertAdjacentHTML('beforeend', label);
        return this;
      }

      this.labelElement.appendChild(label);
      return this;
    },

    /* Replace the contents with the passed HTMLString, String, or HTMLElement(s).
     * @public
     */
    setContent: function setContent(content) {
      this.body.innerHTML = '';

      if ((typeof content).toLowerCase() === 'string') {
        this.body.insertAdjacentHTML('beforeend', content);
        return this;
      }

      this.body.appendChild(content);
      return this;
    },

    /* Appends the passed HTML Nodes to the `body`.
     * @param {string|NodeElement} element
     * @param {boolean} prepend
     * @public
     */
    addContent: function addContent(element, prepend) {
      if ((typeof element).toLowerCase() === 'string') {
        var position = prepend ? 'afterbegin' : 'beforeend';
        this.body.insertAdjacentHTML(position, element);
        return this;
      }

      this.body.appendChild(element);
      return this;
    },

    getContent: function getContent() {
      return this.body.children;
    },

    toggle: function toggle() {
      if (this.disabled) return;

      if (this.active) this.deactivate();
      else this.activate();

      this.clearState();
      return this;
    },

    clearState: function clearState() {
      this.dom.removeClass(this.el, ['-is-error']);
      return this;
    },

    /* Sets error state.
     * @public
     */
    error: function error() {
      this.dom.addClass(this.el, ['-is-error']);
      return this;
    },

    _activate: function _activate() {
      Widget.prototype._activate.call(this);
      Events.on(this._document, 'click', this._documentClickHandlerRef);
    },

    _deactivate: function _deactivate() {
      Widget.prototype._deactivate.call(this);
      Events.off(this._document, 'click', this._documentClickHandlerRef);
    },

    _documentClickHandler: function _documentClickHandler(ev) {
      if (this.dom.isChildOf(ev.target, this.el) === false) {
        this.deactivate();
      }
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      Events.off(this.head, 'click', this._toggleRef);
      Events.off(this._document, 'click', this._documentClickHandlerRef);
      this._toggleRef = this._documentClickHandlerRef = null;
      this.el = this.head = this.body = this.labelElement = null;
      return null;
    }
  }
});
