/* globals App */
/* @class CV.PopoverBlocker – Creates pop overs that when activated they will be placed on top of every content,
 *
 * @options
 * placement [String] (top) top|right|bottom|left
 * toggler <required> [HTMLElement] (null) The element that will show/hide the popover upon click
 * container <optional> [HTMLElement] (document.body) The element to disable when activated
 * title <optional> [String] (null) popover's title
 * content <optional> [HTMLElement, HTMLString] (null) Popover's content
 * showCloseButton <optional> [Boolean] (false) Add the close button on the header
 *
 * @usage
 *  new CV.PopoverBlocker({
        toggler: document.querySelector('.button'),
        container: document.querySelector('.container'),
        title : 'Title',
        content: '<h1>Hello</h1>',
        showCloseButton : true
    }).render();
 */

var transitionEnd = require('../lib/ontransitionend');

Class(CV, 'PopoverBlocker').inherits(Widget)({
  HTML: '\
    <div class="ui-popover">\
      <div class="ui-popover__body-wrapper -rel">\
        <div class="ui-popover-body"></div>\
      </div>\
      <div class="ui-popover__arrow"></div>\
    </div>',

  HTML_HEADER: '\
    <div class="ui-popover__header -rel">\
      <div class="ui-popover-title-wrapper -ellipsis">\
        <span class="ui-popover-title -font-light -rel -color-bg-white"></span>\
      </div>\
    </div>',

  prototype: {
    toggler: null,
    container: null,
    placement: 'top',
    title: null,
    content: null,
    showCloseButton: false,
    hasScrollbar: false,

    el: null,
    headerElement: null,
    titleElement: null,
    closeButton: null,
    contentElement: null,
    arrowElement: null,
    backdropElement: null,
    parentElement: null,

    init: function init(config) {
      this.container = document.body;

      Widget.prototype.init.call(this, config);

      this.el = this.element[0];
      this.contentElement = this.el.querySelector('.ui-popover-body');
      this.arrowElement = this.el.querySelector('.ui-popover__arrow');
      this.backdropElement = document.createElement('div');

      this._autoSetup()._bindEvents();
    },

    _autoSetup: function _autoSetup() {
      if (this.hasScrollbar) {
        this.el.classList.add('has-scrollbar');
      }

      this.backdropElement.classList.add('ui-popover-backdrop');
      this.el.classList.add('-' + this.placement);

      if (this.title || this.showCloseButton) {
        this.el.insertAdjacentHTML('afterbegin', this.constructor.HTML_HEADER);
        this.headerElement = this.el.querySelector('.ui-popover__header');

        if (this.title) {
          this.titleElement = this.headerElement.querySelector('.ui-popover-title');
          this.titleElement.textContent = this.title;
        }

        if (this.showCloseButton) {
          this.appendChild(new CV.UI.Close({
            name : 'closeButton',
            className : 'ui-popover-close -abs -color-bg-white',
            svgClassName : '-s16'
          })).render(this.headerElement);
        }
      }

      if (this.content) {
        this.setContent(this.content);
      }

      return this;
    },

    _bindEvents: function _bindEvents() {
      if (this.toggler) {
        this._toggleHandlerRef = this.toggle.bind(this);
        this.toggler.addEventListener('click', this._toggleHandlerRef, false);
      }

      this._backdropClickHandlerRef = this._backdropClickHandler.bind(this);
      this.backdropElement.addEventListener('click', this._backdropClickHandlerRef);

      if (this.closeButton) {
        this._closeHandlerRef = this.deactivate.bind(this);
        this.closeButton.bind('click', this._closeHandlerRef);
      }
    },

    _backdropClickHandler: function _backdropClickHandlerRef(ev) {
      if (ev.target !== this.backdropElement) {
        return void 0;
      }

      this.deactivate();
    },

    /* Replaces the HTML of `popover-content` element.
     * @public
     * @param content <required> [HTMLString] the new content for `popover-content` element
     * @return {Object} CV.PopoverBlocker
     */
    setContent: function setContent(content) {
      while(this.contentElement.firstChild) {
        this.contentElement.removeChild(this.contentElement.firstChild);
      }

      if (typeof content === 'function') {
        this.appendChild(new content({
          name : 'bubbleAction',
          data : this.data
        })).render(this.contentElement);
        return this;
      }

      if ((typeof content).toLowerCase() === 'string') {
        this.contentElement.insertAdjacentHTML('afterbegin', content);
        return this;
      }

      this.contentElement.appendChild(content);
      return this;
    },

    getContent: function getContent() {
      return this.contentElement;
    },

    /* Activate/Deactivate the popover
     * @method toggle <public> [Function]
     * @return this [CV.Popover]
     */
    toggle: function toggle() {
      if (this.active) {
        this.deactivate();
      } else {
        this.activate();
      }
      return this;
    },

    /* Append the element inside the backdrop and update sets its position.
     * @method _placeElement <private> [Function]
     */
    _placeElement: function _placeElement() {
      var bounds = this.el.getBoundingClientRect();
      var coords = [bounds.left, bounds.top];

      this.el.style.position = 'absolute';
      this.el.style.left = coords[0] + 'px';
      this.el.style.top = coords[1] + 'px';
      this.el.style.bottom = 'initial';

      this.backdropElement.appendChild(this.el);

      bounds = coords = null;
    },

    /* Return the element to its original container and remove the custom styles.
     * @method _unplaceElement <private> [Function]
     */
    _unplaceElement: function _unplaceElement() {
      this.el.style.position = '';
      this.el.style.left = '';
      this.el.style.top = '';
      this.el.style.bottom = '';
      this.parentElement.appendChild(this.el);
    },

    /* Activate handler
     * @method _activate <private> [Function]
     */
    _activate: function _activate() {
      Widget.prototype._activate.call(this);

      App.hideScrollbar();

      this._placeElement();
      this.container.appendChild(this.backdropElement);

      requestAnimationFrame(function() {
        this.backdropElement.classList.add('active');
      }.bind(this));
    },

    /* Deactivate handler
     * @method <private> [Function]
     */
    _deactivate: function _deactivate() {
      Widget.prototype._deactivate.call(this);

      App.showScrollbar();

      this._unplaceElement();
      this.backdropElement.classList.remove('active');

      transitionEnd(this.backdropElement, function() {
        this.container.removeChild(this.backdropElement);
        this.dispatch('afterDeactivate');
      }.bind(this));
    },

    render: function render(element, beforeElement) {
      Widget.prototype.render.call(this, element, beforeElement);

      this.parentElement = this.el.parentElement;
      this.parentElement.classList.add('ui-has-popover');

      return this;
    },

    destroy: function destroy() {
      if (this.backdropElement.parentNode) {
        this.backdropElement.parentNode.removeChild(this.backdropElement);
      }

      if (this.closeButton) {
        this._closeHandlerRef = null;
      }

      if (this.toggler) {
        this.toggler.removeEventListener('click', this._toggleHandlerRef, false);
        this._toggleHandlerRef = null;
      }

      this.backdropElement.removeEventListener('click', this._backdropClickHandlerRef);
      this._backdropClickHandlerRef = null;

      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
