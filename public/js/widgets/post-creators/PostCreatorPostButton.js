/* jshint multistr: true */
Class(CV, 'PostCreatorPostButton').inherits(Widget).includes(CV.WidgetUtils)({

    ELEMENT_CLASS : 'from-sources-post-button',

    HTML : '\
        <div>\
            <button class="cv-button small primary -pl2 -pr2" data-button>Post <span data-counter></span></button>\
        </div>\
    ',

    prototype : {
        init : function init(config)  {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.button = this.el.querySelector('[data-button]');
            this.counter = this.el.querySelector('[data-counter]');

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._buttonClickHandlerRef = this._buttonClickHandler.bind(this);
            this.button.addEventListener('click', this._buttonClickHandlerRef);

            return this;
        },

        /* Updates the button badge counter. Indicates the number of posts added to the queue.
         * @method updateCounter <public> [Function]
         */
        updateCounter : function updateCounter(postCount) {
            var valueString = '';

            if (postCount) {
                valueString = ' (' + postCount + ')';
            }

            this.dom.updateText(this.counter, valueString);
            return this;
        },

        _buttonClickHandler : function _buttonClickHandler() {
            this.dispatch('buttonClick');
        },

        _disable : function _disable() {
            Widget.prototype._disable.call(this);
            this.button.classList.add('-muted');
            this.button.setAttribute('disabled', true);
        },

        _enable : function _enable() {
            Widget.prototype._enable.call(this);
            this.button.classList.remove('-muted');
            this.button.removeAttribute('disabled');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.el = null;

            this.button.removeEventListener('click', this._buttonClickHandlerRef);
            this._buttonClickHandlerRef = null;

            return null;
        }
    }
});
