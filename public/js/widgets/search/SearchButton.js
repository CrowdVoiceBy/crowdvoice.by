var Events = require('../../lib/events');

Class(CV, 'SearchButton').inherits(Widget)({
    HTML : '\
    <button class="cv-button small rounded -p0 ui-has-tooltip">\
        <svg class="header-actions-svg header-search-svg -s14">\
            <use xlink:href="#svg-search"></use>\
        </svg>\
        <span class="ui-tooltip -bottom-right -nw">Search</span>\
    </button>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            this.appendChild(new CV.Search({
                name : 'search'
            })).render(document.body);

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._clickElementRef = this.toggle.bind(this);
            Events.on(this.el, 'click', this._clickElementRef);

            this.search.bind('close', this._clickElementRef);
            return this;
        },

        /* Toggle active/deactive states.
         * @method toggle <public> [Function]
         * @return this.active [Boolean]
         */
        toggle : function toggle() {
            if (this.active) {
                this.deactivate();
            } else {
                this.activate();
            }
            return this.active;
        },

        _activate : function _activate() {
            Widget.prototype._activate.call(this);
            this.search.activate();
        },

        _deactivate : function _deactivate() {
            Widget.prototype._deactivate.call(this);
            this.search.deactivate();
        },

        destroy : function destroy() {
            this.search.unbind('close', this._clickElementRef);
            Events.off(this.el, 'click', this._clickElementRef);
            this._clickElementRef = null;

            Widget.prototype.destroy.call(this);
            return null;
        }
    }
});
