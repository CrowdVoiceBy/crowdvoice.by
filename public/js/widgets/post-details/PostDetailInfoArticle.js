Class(CV, 'PostDetailInfoArticle').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'pd__info-article -full-height',

    HTML : '\
        <div>\
            <iframe class="-full-width -full-height"></iframe>\
        </div>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            var url = '/' + this.data.voice.owner.profileName + '/' + this.data.voice.slug + '/' + this.data.id;
            this.dom.updateAttr('src', this.element[0].querySelector('iframe'), url);
        }
    }
});
