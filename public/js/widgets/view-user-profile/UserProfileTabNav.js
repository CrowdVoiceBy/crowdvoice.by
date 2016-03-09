Class(CV, 'UserProfileTabNav').inherits(CV.TabNav)({
    ELEMENT_CLASS : 'user-profile-tab -text-center -clickable',
    HTML : '\
        <div>\
            <div class="user-profile-tab__counter">0</div>\
            <div class="user-profile-tab__label"></div>\
        </div>',

    prototype : {
        _counter : 0,

        init : function init(config) {
            CV.TabNav.prototype.init.call(this, config);
            this.counterElement = this.el.querySelector('.user-profile-tab__counter');
            this.labelElement = this.el.querySelector('.user-profile-tab__label');

            this.dom.updateText(this.labelElement, this.label);
            this._bindEvents();
        },

        increaseCounter : function increaseCounter(number) {
            this._counter += number;
            this.updateCounter(this._counter);
            return this._counter;
        },

        /* Updates the counter element textContent.
         * @method updateCounter <public>
         * @return UserProfileTabNav
         */
        updateCounter : function updateCounter(number) {
            this.dom.updateText(this.counterElement, number);
            return this;
        },

        _bindEvents : function _bindEvents() {
            CV.TabNav.prototype.bindEvents.call(this);
        }
    }
});
