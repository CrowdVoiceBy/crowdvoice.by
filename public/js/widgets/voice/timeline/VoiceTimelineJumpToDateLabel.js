/* jshint multistr: true */
Class(CV, 'VoiceTimelineJumpToDateLabel').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'voice-timeline-popover_label -line-through',

    HTML : '\
        <div>\
            <span class="-line-through-label -color-neutral-mid"></span>\
        </div>',

    prototype : {
        label : '',

        el : null,
        labelElement : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.labelElement = this.el.getElementsByTagName('span')[0];

            this.dom.updateText(this.labelElement, this.label);
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.el = null;
            this.labelElement = null;

            return null;
        }
    }
});
