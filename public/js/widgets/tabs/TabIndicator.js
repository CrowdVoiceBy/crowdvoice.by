Class(CV, 'TabIndicator').inherits(Widget)({
    ELEMENT_CLASS : 'ui-tab-indicator',

    prototype : {
        _currentElement : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
        },

        /* Updates the indicator position to the passed element relative coordinates.
         * @method update <protected> [Function]
         * @return undefined
         */
        update : function update(el) {
            var left = el.offsetLeft;
            var width = el.offsetWidth;
            this._currentElement = el;

            this.el.style.transform = 'translateX(' + left + 'px)';
            this.el.style.width = width + 'px';
        }
    }
});
