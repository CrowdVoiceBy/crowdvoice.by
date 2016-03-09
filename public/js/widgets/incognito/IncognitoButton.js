var Person = require('./../../lib/currentPerson');

Class(CV, 'IncognitoButton').inherits(Widget)({
    HTML : '\
    <button class="header-actions-button cv-button small rounded -p0 ui-has-tooltip">\
        <svg class="header-actions-svg -s19">\
            <use xlink:href="#svg-incognito"></use>\
        </svg>\
        <span class="ui-tooltip -bottom -nw">Anonymous Mode</span>\
    </button>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            if (Person.anon()) {
                this.activate();
            }

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this.el.addEventListener('click', function() {
                this.el.classList.toggle('active');
                window.location = '/switchPerson';
            }.bind(this));
        }
    }
});
