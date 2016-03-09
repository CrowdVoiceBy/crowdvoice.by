Class(CV, 'VoiceCoverTitle').inherits(Widget).includes(CV.WidgetUtils)({
    HTML : '\
        <article class="cv-voice-cover centeredTitle mini -clearfix" role="article">\
            <img class="voice-cover -color-bg-neutral-x-light -float-left" width="32" height="32"/>\
            <div class="voice-content -table -full-height">\
                <div class="-table-cell -vam">\
                    <p class="voice-cover-title">\
                        <a class="voice-cover-title-anchor -font-semi-bold -tdn"></a>\
                    </p>\
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
            if (this.data.images.small) {
                this.dom.updateAttr('src', this.el.querySelector('.voice-cover'), this.data.images.small.url);
            } else {
                this.el.querySelector('.voice-cover').classList.add('-colored-background');
            }
            this.dom.updateAttr('href', this.el.querySelector('.voice-cover-title-anchor'), '/' + this.data.owner.profileName + '/' + this.data.slug + '/');
            this.dom.updateText(this.el.querySelector('.voice-cover-title-anchor'), this.data.title);
        }
    }
});
