Class(CV, 'ResponsiveWidth')({
    prototype : {
        container : null,
        items : null,
        minWidth : 0,

        _window : null,
        _itemsThatFit : 1,

        init : function init(config) {
            Object.keys(config || {}).forEach(function(propertyName) {
                this[propertyName] = config[propertyName];
            }, this);

            this._window = window;

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._setupRef = this.setup.bind(this);
            this._window.addEventListener('resize', this._setupRef);
            return this;
        },

        setup : function setup() {
            var availableWidth = this.container.getBoundingClientRect().width;
            this._itemsThatFit = 1;

            if (this.minWidth && (availableWidth > this.minWidth)) {
               this._itemsThatFit = Math.floor(availableWidth / this.minWidth);
            }

            return this._update();
        },

        _update : function _update() {
            var itemsWidth = (100 / this._itemsThatFit);
            this.items.forEach(function(item) {
                item.style.width = itemsWidth + '%';
            });

            return this;
        },

        update : function update() {
            this.setup();
        },

        destroy : function destroy() {
            this._window.removeEventListener('resize', this._setupRef);
            this._setupRef = null;

            this.container = null;
            this.items = null;
            this.minWidth = null;

            this._window = null;
            this._itemsThatFit = null;

            return null;
        }
    }
});
