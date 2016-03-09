var Events = require('./../../lib/events');

Class(CV, 'PostDetailNavigation').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
  prototype: {
    renderTo: null,
    init : function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._setup()._bindEvents();
    },

    _setup : function _setup() {
      this.appendChild(new Widget({
        name: 'prevButtonWrapper',
        className: 'cv-post-detail__nav-button-wrapper prev'
      }));
      this.appendChild(new CV.UI.Button({
        name : 'prevButton',
        className: 'cv-post-detail__nav-button -clickable'
      }))
      .updateHTML('<svg class="-s20"><use xlink:href="#svg-arrow-left"></use></svg>')
      .render(this.prevButtonWrapper.element);
      this.dom.removeClass(this.prevButton.el, ['cv-button']);
      this.prevButtonWrapper.render(this.renderTo);

      this.appendChild(new Widget({
        name: 'nextButtonWrapper',
        className: 'cv-post-detail__nav-button-wrapper next'
      }));
      this.appendChild(new CV.UI.Button({
        name : 'nextButton',
        className: 'cv-post-detail__nav-button -clickable'
      }))
      .updateHTML('<svg class="-s20"><use xlink:href="#svg-arrow-right"></use></svg>')
      .render(this.nextButtonWrapper.element);
      this.dom.removeClass(this.nextButton.el, ['cv-button']);
      this.nextButtonWrapper.render(this.renderTo);

      return this;
    },

    _bindEvents : function _bindEvents() {
      this._prevHandlerRef = this._prevHandler.bind(this);
      Events.on(this.prevButton.el, 'click', this._prevHandlerRef);

      this._nextHandlerRef = this._nextHandler.bind(this);
      Events.on(this.nextButton.el, 'click', this._nextHandlerRef);
    },

    enablePrevButton : function enablePrevButton() {
      this.prevButton.enable();
    },

    disablePrevButton : function disablePrevButton() {
      this.prevButton.disable();
    },

    enableNextButton : function enableNextButton() {
      this.nextButton.enable();
    },

    disableNextButton : function disableNextButton() {
      this.nextButton.disable();
    },

    _prevHandler : function _prevHandler() {
      this.dispatch('prevPostDetail');
    },

    _nextHandler : function _nextHandler() {
      this.dispatch('nextPostDetail');
    }
  }
});
