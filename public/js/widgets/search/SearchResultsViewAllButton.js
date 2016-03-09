var origin = require('get-location-origin');

Class(CV, 'SearchResultsViewAllButton').inherits(Widget).includes(CV.WidgetUtils)({
    prototype : {
        totals : 0,
        queryString : '',

        el : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            this.appendChild(new CV.UI.Button({
                name : 'button',
                className : '-full-width',
                data: {value : 'View all ' + this.totals + ' results »'}
            })).render(this.el);

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            this.el.addEventListener('click', this._clickHandlerRef);
        },

        /* Redirects to the public search view.
         */
        _clickHandler : function _clickHandler() {
            window.location.href = origin + '/search/' + this.queryString;
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.el.removeEventListener('click', this._clickHandlerRef);
            this._clickHandlerRef = null;

            this.totals = this.queryString = null;
            this.el = null;

            return null;
        }
    }
});
