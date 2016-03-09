/* jshint multistr: true */
var rome = require('rome');
var moment = require('moment');
var Events = require('./../../../lib/events');

Class(CV, 'PostCreatorWriteArticlePostDate').inherits(Widget)({
    ELEMENT_CLASS : 'write-article-post-date',

    HTML : '\
        <div>\
            <div class="-full-height">\
                <div class="write-article-title-wrapper -inline-block">\
                    <span class="write-article-title -font-bold">Write an Article</span>\
                    <div class="input-error-message -on-error -abs -color-negative">You entered an invalid URL. Please double check it.</div>\
                </div>\
                <div class="write-article-post-date-wrapper -float-right">\
                    <span class="date-label">Post date</span>\
                    <div class="write-article-date-picker -inline-block">\
                        <button class="post-date-picker-button cv-button primary tiny -m0 -float-right">\
                            <svg class="post-edit-date-picker-calendar -color-white">\
                                <use xlink:href="#svg-calendar"></use>\
                            </svg>\
                        </button>\
                        <div class="-overflow-hidden">\
                            <input class="cv-input tiny">\
                        </div>\
                    </div>\
                </div>\
            </div>\
        </div>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.timePickerInput = this.el.querySelector('.write-article-date-picker .cv-input');
            this.timePickerButton = this.el.querySelector('.post-date-picker-button');
            this.errorFeedback = this.el.querySelector('.input-error-message');

            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.romeTime = rome(this.timePickerInput, {
                inputFormat : 'DD MMM, YYYY HH:mm',
                initialValue : moment()
            });

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._showDatePickerRef = this._showDatePicker.bind(this);
            Events.on(this.romeTime.associated, 'click', this._showDatePickerRef);
            Events.on(this.timePickerButton, 'click', this._showDatePickerRef);

            return this;
        },

        _showDatePicker : function _showDatePicker(ev) {
            ev.stopPropagation();
            this.romeTime.show();
            this.romeTime.container.style.zIndex = 3;
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.off(this.romeTime.associated, 'click', this._showDatePickerRef);
            Events.off(this.timePickerButton, 'click', this._showDatePickerRef);
            this._showDatePickerRef = null;
            this.romeTime.destroy();
            return null;
        }
    }
});
