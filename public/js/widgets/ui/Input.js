var Events = require('./../../lib/events');

Class(CV.UI, 'Input').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'ui-form-field',
    HTML : '<div><div class="ui-input-wrapper"></div></div>',
    LABEL_HTML : '\
        <label class="-block">\
            <span class="ui-input__label -upper -font-bold"></span>\
            <span class="cv-caption"></span>\
        </label>',
    INPUT_HTML : '<input class="ui-input"/>',
    TEXTAREA_HTML : '<textarea class="ui-textarea"></textarea>',
    SVG_HTML : '<svg class="ui-input-svg -s14"><use xlink:href="#svg-{name}"></use></svg>',

    prototype : {
        data : {
            isTextArea : false,
            label : '',
            hint : '',
            inputClassName : null,
            attr : null
        },

        _input : null,
        labelElement : null,
        hintElement : null,
        hasError : false,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.inputWrapper = this.el.querySelector('.ui-input-wrapper');
            this._unique = this.name + '_' + Math.random().toString().replace(/\./,'');
            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            if (this.data.label || this.data.hint) {
                this.inputWrapper.insertAdjacentHTML('beforebegin', this.constructor.LABEL_HTML);
                this.dom.updateAttr('for', this.el.getElementsByTagName('label')[0], this._unique);
                this.labelElement = this.el.getElementsByClassName('ui-input__label')[0];
                this.hintElement = this.el.getElementsByClassName('cv-caption')[0];
                this.dom.updateText(this.labelElement, this.data.label);
                this.dom.updateHTML(this.hintElement, this.data.hint || '');
            }

            if (this.data.isTextArea) {
                this.inputWrapper.insertAdjacentHTML('afterbegin', this.constructor.TEXTAREA_HTML);
                this._input = this.inputWrapper.getElementsByTagName('textarea')[0];
            } else {
                this.inputWrapper.insertAdjacentHTML('afterbegin', this.constructor.INPUT_HTML);
                this._input = this.inputWrapper.getElementsByTagName('input')[0];
            }

            if (this.data.attr) {
                Object.keys(this.data.attr).forEach(function(propertyName) {
                    this.dom.updateAttr(propertyName, this._input, this.data.attr[propertyName]);
                }, this);
            }

            if (this.data.inputClassName) {
                this.dom.addClass(this._input, this.data.inputClassName.split(/\s/));
            }

            this.dom.updateAttr('id', this._input, this._unique);

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._clearStateRef = this.clearState.bind(this);
            Events.on(this._input, 'keydown', this._clearStateRef);
        },

        getValue : function getValue() {
            return this._input.value;
        },

        setValue : function setValue(value) {
            this._input.value = value;
            return this;
        },

        getInput : function getInput() {
            return this._input;
        },

        /* Updates the hint text. Optionally you can also add new class selector names to the element too.
         * If no param is passed it will default to the hint text passed as config.
         * @method updateHint <public> [Function]
         * @argument data <optional> [Object]
         * @argument data.hint [String] the new hint text
         * @argument data.className [String] class selector names to add
         */
        updateHint : function updateHint(data) {
            this.hintElement.className = 'cv-caption';

            if (!data) {
                this.dom.updateText(this.hintElement, this.data.hint);
                return this;
            }

            this.dom.updateText(this.hintElement, data.hint);
            if (data.className) {
                this.dom.addClass(this.hintElement, data.className.split(/\s/));
            }
            return this;
        },

        clearState : function clearState() {
            this.hasError = false;
            this.dom.removeClass(this.inputWrapper, ['-is-error', '-is-success']);
            this._removeIcon();
            return this;
        },

        /* Sets error state.
         * @method error <public>
         */
        error : function error() {
            this.hasError = true;
            this._setIcon('warning');
            this.inputWrapper.classList.add('-is-error');
            return this;
        },

        /* Sets success state.
         * @method success <public>
         */
        success : function success() {
            this.hasError = false;
            this._setIcon('checkmark');
            this.inputWrapper.classList.add('-is-success');
            return this;
        },

        /* Sets svg icon.
         * @method _setIcon <private>
         */
        _setIcon : function _setIcon(name) {
            var icon = this.constructor.SVG_HTML.replace(/{name}/, name);
            this._removeIcon();
            this.inputWrapper.insertAdjacentHTML('beforeend', icon);
            return this;
        },

        /* Removes the svg icon.
         * @method _removeIcon <private>
         */
        _removeIcon : function _removeIcon() {
            var icon = this.el.querySelector('.ui-input-svg');
            if (icon) {
                icon.parentNode.removeChild(icon);
            }
        },

        _disable : function _disable() {
            Widget.prototype._disable.call(this);
            this.getInput().setAttribute('disabled', true);
        },

        _enable : function _enable() {
            Widget.prototype._enable.call(this);
            this.getInput().removeAttribute('disabled');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.off(this._input, 'keydown', this._clearStateRef);
            this._clearStateRef = null;
            return null;
        }
    }
});
