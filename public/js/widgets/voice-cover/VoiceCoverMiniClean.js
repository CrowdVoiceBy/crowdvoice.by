Class(CV, 'VoiceCoverMiniClean').inherits(Widget).includes(CV.WidgetUtils)({
    HTML : '\
        <article class="cv-voice-cover mini -clearfix" role="article">\
            <img class="voice-cover -float-left" width="36" height="36"/>\
            <div class="voice-content">\
                <p class="voice-cover-title -font-semi-bold -tdn">\
                    {{voice-title}}\
                </p>\
                <div class="meta">\
                    <div class="author -inline-block">\
                        By <span class="author-username">{{voice-owner-name}}</span>\
                    </div>\
                </div>\
            </div>\
            <div class="action"></div>\
        </article>',

    prototype : {
        /* VoiceEntity
         * @property data <required> [Object]
         */
        data : {},

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._setup();
        },

        _setup : function _setup() {
            this.dom.updateAttr('src', this.el.querySelector('.voice-cover'), this.data.images.small.url);
            this.dom.updateText(this.el.querySelector('.voice-cover-title'), this.data.title);
            this.dom.updateText(this.el.querySelector('.author-username'), this.data.owner.name);
        }
    }
});
