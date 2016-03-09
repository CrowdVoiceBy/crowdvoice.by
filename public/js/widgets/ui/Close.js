var Events = require('./../../lib/events');

Class(CV.UI, 'Close').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'ui-close-button -clickable',
    HTML : '\
        <button>\
            <svg class="ui-close-button__svg -clickable">\
                <use xlink:href="#svg-close"></use>\
            </svg>\
        </button>',

    prototype : {
        svgClassName : '',

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.dom.addClass(this.el.getElementsByTagName('svg')[0], this.svgClassName.split(/\s/));
            return this;
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.el, 'click', this._clickHandlerRef);
            return this;
        },

        _clickHandler : function _clickHandler() {
            this.dispatch('click');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.off(this.el, 'click', this._clickHandlerRef);
            this._clickHandlerRef = null;
            return null;
        }
    }
});
