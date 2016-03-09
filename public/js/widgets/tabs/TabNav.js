Class(CV, 'TabNav').inherits(Widget).includes(CV.WidgetUtils)({
    HTML : '\
        <div class="ui-tab -inline-block">\
            <p></p>\
        </div>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
        },

        setup : function setup() {
            this.dom.updateText(
                this.el.getElementsByTagName('p')[0],
                this.title
            );

            this.bindEvents();
        },

        bindEvents : function bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            this.el.addEventListener('click', this._clickHandlerRef);
        },

        _clickHandler : function _clickHandler() {
            this.dispatch('click');
        }
    }
});
