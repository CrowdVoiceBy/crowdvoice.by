var Events = require('./../../lib/events');

Class(CV.UI, 'Checkbox').inherits(Widget).includes(CV.WidgetUtils)({
    HTML : '\
        <div class="ui-checkbox">\
            <label>\
                <input class="ui-checkbox-checkbox" type="checkbox"/>\
                <span class="ui-checkbox-element">\
                    <svg class="-s8">\
                        <use xlink:href="#svg-checkmark"></use>\
                    </svg>\
                </span>\
                <span class="ui-checkbox-label"></span>\
            </label>\
        </div>',

    prototype : {
        data : {
            label : '',
            checked : false
        },

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.checkbox = this.el.querySelector('.ui-checkbox-checkbox');
            this.labelElement = this.el.querySelector('.ui-checkbox-label');
            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            if (this.data.label) {
                this.dom.updateText(this.labelElement, this.data.label);
            }

            if (this.data.checked) {
                this.check();
            }

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._changeHandler.bind(this);
            Events.on(this.checkbox, 'change', this._clickHandlerRef);
        },

        /* Returns the checkbox checked state.
         * @method isChecked <public> [Function]
         * @return this.checkbox.checkbox [Boolean]
         */
        isChecked : function isChecked() {
            return this.checkbox.checked;
        },

        /* Sets the checkbox check property as `true`.
         * @method check <public>
         * @return Checkbox
         */
        check : function check() {
            this.checkbox.checked = true;
            this._changeHandler();
            return this;
        },

        /* Sets the checkbox check property as `false`.
         * @method uncheck <public>
         * @return Checkbox
         */
        uncheck : function uncheck() {
            this.checkbox.checked = false;
            this._changeHandler();
            return this;
        },

        /* Handles the checkbox `change` event.
         * @method _changeHandler <private>
         * @return undefined
         */
        _changeHandler : function _changeHandler() {
            this.dispatch('changed');
        },

        _enable : function _enable() {
            Widget.prototype._enable.call(this);
            this.checkbox.removeAttribute('disabled');
        },

        _disable : function _disable() {
            Widget.prototype._disable.call(this);
            this.checkbox.setAttribute('disabled', true);
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.on(this.checkbox, 'change', this._clickHandlerRef);
            this._clickHandlerRef = null;
            return null;
        }
    }
});
