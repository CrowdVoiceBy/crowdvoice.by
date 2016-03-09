var Events = require('./../../lib/events');

Class(CV.UI, 'InputButtonResultsItem').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
    HTML : '<li></li>',
    ELEMENT_CLASS : 'cv-list-results__item',
    prototype : {
        content : null,
        data : null,
        init : function(config){
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.el.appendChild(this.content);

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.el, 'click', this._clickHandlerRef);
        },

        _clickHandler : function _clickHandler(ev) {
            ev.preventDefault();
            this.dispatch('results:item:clicked', {data: this.data});
        }
    }
});
