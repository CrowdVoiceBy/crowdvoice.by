Class(CV, 'TabContent').inherits(Widget)({
    ELEMENT_CLASS : 'ui-tab-content -menu-tab-content',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            if (typeof this.content === 'function') {
                this.appendChild(new this.content({
                    name : this.name,
                    data : this.data
                })).render(this.el);
            }
        },

        _activate : function _activate() {
            Widget.prototype._activate.call(this);
            if (typeof this.content.activate === "function") {
                this.content.activate();
            }
        }
    }
});
