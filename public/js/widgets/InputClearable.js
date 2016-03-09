var Events = require('./../lib/events');

Class(CV, 'InputClearable').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'cv-input-clearable -rel',

    HTML : '\
        <div>\
            <input class="ui-input" placeholder=""/>\
            <svg class="cv-input-clearable__clear -abs -clickable">\
                <use xlink:href="#svg-circle-x"></use>\
            </svg>\
        </div>',

    ACTIVE_CLASSNAME : 'active',

    prototype : {
        value : '',
        placeholder : '',
        inputClass : '',
        min : 2,

        el : null,
        clearButton : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            this.inputElement = this.el.getElementsByTagName('input')[0];
            this.clearButton = this.el.querySelector('.cv-input-clearable__clear');

            this._autoSetup()._bindEvents();
        },

        _autoSetup : function _autoSetup() {
            if (this.value) {
                this.setValue(this.value);
            }

            if (this.placeholder) {
                this.dom.updateAttr('placeholder', this.inputElement, this.placeholder);
            }

            if (this.inputClass) {
                this.inputClass.split(' ').forEach(function(className) {
                    this.inputElement.classList.add(className);
                }, this);
            }

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._keyDownHandlerRef = this._keyDownHandler.bind(this);
            Events.on(this.inputElement, 'keyup', this._keyDownHandlerRef);

            this._clearClickHandlerRef = this._clearClickHandler.bind(this);
            Events.on(this.clearButton, 'click', this._clearClickHandlerRef);

            return this;
        },

        /* Updates the input value with the passed string
         * @method setValue <public> [Function]
         * @return [InputClearable]
         */
        setValue : function setValue(value) {
            this.inputElement.value = value;
        },

        /* Returns the value of the input element
         * @method getValue <public> [Function]
         * @return this.inputElement.value [String]
         */
        getValue : function getValue() {
            return this.inputElement.value;
        },

        /* Returns the inputElement
         * @method getElement <public> [Function]
         * @return this.inputElement
         */
        getElement : function getElement() {
            return this.inputElement;
        },

        /* Force to display the clearButton.
         * @method showClearButton <public> [Function]
         * @return InputClearable
         */
        showClearButton : function showClearButton() {
            this.clearButton.style.visibility = 'visible';
            this.clearButton.classList.add('active');
            return this;
        },

        /* Force to hide the clearButton.
         * @method hideClearButton <public> [Function]
         * @return InputClearable
         */
        hideClearButton : function hideClearButton() {
            this.clearButton.style.visibility = 'hidden';
            this.clearButton.classList.remove('active');
            return this;
        },

        _keyDownHandler : function _keyDownHandler() {
            var x = (this.getValue().length > this.min) ? 'add' : 'remove';

            this.clearButton.classList[x](this.constructor.ACTIVE_CLASSNAME);
        },

        _clearClickHandler : function _clearClickHandler() {
            this.inputElement.value = "";
            this.clearButton.classList.remove(this.constructor.ACTIVE_CLASSNAME);
            this.inputElement.focus();
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            Events.off(this.inputElement, 'keyup', this._keyDownHandlerRef);
            this._keyDownHandlerRef = null;

            Events.off(this.clearButton, 'click', this._clearClickHandlerRef);
            this._clearClickHandlerRef = null;

            this.placeholder = null;
            this.inputClass = null;

            this.el = null;
            this.clearButton = null;

            return null;
        }
    }
});
