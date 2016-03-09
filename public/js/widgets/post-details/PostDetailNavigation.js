var Events = require('./../../lib/events');

Class(CV, 'PostDetailNavigation').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
    ELEMENT_CLASS : 'cv-post-detail__header-navigation',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.appendChild(new CV.UI.Button({
                name : 'prevButton',
                className: 'cv-post-detail__header-navigation-button'
            })).updateHTML('<svg class="-s20"><use xlink:href="#svg-arrow-left"></use></svg>').render(this.el);

            this.appendChild(new CV.UI.Button({
                name : 'nextButton',
                className: 'cv-post-detail__header-navigation-button'
            })).updateHTML('<svg class="-s20"><use xlink:href="#svg-arrow-right"></use></svg>').render(this.el);

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._prevHandlerRef = this._prevHandler.bind(this);
            Events.on(this.prevButton.el, 'click', this._prevHandlerRef);

            this._nextHandlerRef = this._nextHandler.bind(this);
            Events.on(this.nextButton.el, 'click', this._nextHandlerRef);
        },

        _prevHandler : function _prevHandler() {
            this.dispatch('prevPostDetail');
        },

        _nextHandler : function _nextHandler() {
            this.dispatch('nextPostDetail');
        }
    }
});
