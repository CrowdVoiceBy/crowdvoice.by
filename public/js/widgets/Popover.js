/* jshint multistr: true */
/* @class CV.Popover – Add small overlays of content
 *
 * @options
 * placement [String] (top) top|right|bottom|left
 * toggler <required> [HTMLElement] (null) The element that will show/hide the popover upon click
 * container <required> [HTMLElement] (null) The element to append the popover
 * content <required> [HTMLString] ('') Popover content
 *
 * @usage
 *  new CV.Popover({
        toggler: document.querySelector('.button'),
        container: document.querySelector('.container'),
        content: '<h1>Hello</h1>'
    }).render();
 */
Class(CV, 'Popover').inherits(Widget)({
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

  CONTAINER_CLASSNAME: 'ui-has-popover',

  prototype: {
    /* options */
    placement: 'top',
    toggler: null,
    container: null,
    title: '',
    content: '',

    init: function init(config) {
      Widget.prototype.init.call(this, config);

      this.el = this.element[0];
      this.contentElement = this.el.querySelector('.ui-popover-body');

      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.container.classList.add(this.constructor.CONTAINER_CLASSNAME);
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
            name: 'closeButton',
            className: 'ui-popover-close -abs -color-bg-white',
            svgClassName: '-s16'
          })).render(this.headerElement);
        }
      }

      if (this.content) {
        this.setContent(this.content);
      }

      return this;
    },

    _bindEvents: function _bindEvents() {
      if (!this.toggler) return;

      this.togglerRef = this.toggle.bind(this);
      this.toggler.addEventListener('click', this.togglerRef, false);
    },

    /* Returns the `popover-content` element
     * @method getContent <public> [Function]
     * @return this.contentElement [HTMLElement]
     */
    getContent: function getContent() {
      return this.contentElement;
    },

    /* Replaces the HTML of `popover-content` element.
     * @public
     * @param content <required> [HTMLString] the new content for `popover-content` element
     * @return {Object} CV.Popover
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
        console.log('STRING');
        this.contentElement.insertAdjacentHTML('afterbegin', content);
        return this;
      }

      console.log('ELE');
      this.contentElement.appendChild(content);
      return this;
    },

    /* Activate/Deactivate the popover
     * @method toggle <public> [Function]
     * @return this [CV.Popover]
     */
    toggle: function toggle() {
      if (this.active) this.deactivate();
      else this.activate();

      return this;
    },

    /* Overrides Widget.prototype.render. Appends the popover to this.container
     * @method render <public> [Function]
     * @return this [CV.Popover]
     */
    render: function render() {
      if (this.__destroyed === true) {
        console.warn('calling on destroyed object');
      }
      this.dispatch('beforeRender');

      this.container.appendChild(this.el);

      this.dispatch('render');

      return this;
    },

    destroy: function destroy(){
      Widget.prototype.destroy.call(this);

      if (this.toggler) {
        this.toggler.removeEventListener('click', this.togglerRef);
        this.togglerRef = null;
      }

      return null;
    }
  }
});
