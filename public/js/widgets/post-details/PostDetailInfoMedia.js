var Person = require('./../../lib/currentPerson');
var moment = require('moment');

Class(CV, 'PostDetailInfoMedia').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'pd__info-media -full-height',

    HTML : '\
        <div>\
            <div class="pd__info-media-header -text-center"></div>\
            <div class="pd__info-media-body">\
                <p class="pd__info-media-meta">\
                    <time></time>\
                    <span class="pd__info-media-meta__source"></span>\
                </p>\
                <p class="pd__info-media-title -font-bold"></p>\
                <div class="pd__info-media-actions cv-post-detail-actions">\
                    <div class="pd__info-media-saved -inline-block">\
                        <svg class="-s16"><use xlink:href="#svg-save-outline"></use></svg>\
                        <span data-saved></span>\
                    </div>\
                    <div class="cv-button-group multiple"></div>\
                    <div class="-inline-block -ml1 -hide">\
                        <a class="actions-view-original-btn cv-button tiny dark" target="_blank">View Original</a>\
                    </div>\
                </div>\
                <p class="pd__info-media-description"></p>\
            </div>\
        </div>',

    IFRAME_STRING : '\
        <div class="pd__info-media-iframe-wrapper -rel">\
            <iframe class="pd__info-media-iframe -abs -full-width -full-height" frameborder="0" allowfullscreen="true"></iframe>\
        </div>',

    reYouTubeVideo : new RegExp('v=((\\w+-?)+)'),
    reVimeoVideo : new RegExp('[0-9]+'),

    FAVICON : '<img class="pd-sidebar-item-meta__icon-image" src="{src}"/>',
    THUMB_TEMPLATE : '<img src="{source}" class="pd-sidebar-item__cover -float-left" width="56" height="56"/>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.headerElement = this.el.querySelector('.pd__info-media-header');
            this.sourceElement = this.el.querySelector('.pd__info-media-meta__source');
            this.dateTimeElement = this.el.querySelector('.pd__info-media-meta > time');
            this.savedElement = this.el.querySelector('[data-saved]');
            this.actionsGroup = this.el.querySelector('.pd__info-media-actions .multiple');

            this._setup();
        },

        _setup : function _setup() {
            if (this.data.sourceType === 'image') {
                this._appendImage(this.data);
            }

            if (this.data.sourceType === 'video') {
                this._appendVideo(this.data);
            }

            if (this.data.faviconPath) {
                this.sourceElement.insertAdjacentHTML('afterbegin', this.constructor.FAVICON.replace(/{src}/, this.data.faviconPath));
                this.sourceElement.insertAdjacentHTML('beforeend', '<a href="' + this.data.sourceDomain + '" target="_blank">'+ this.data.sourceDomain.replace(/.*?:\/\/(w{3}.)?/g, "") + '</a> ');
            } else {
                this.sourceElement.parentNode.removeChild(this.sourceElement);
            }

            this.dom.updateText(this.dateTimeElement, moment(this.data.publishedAt).format('MMM DD, YYYY'));
            this.dom.updateAttr('datetime', this.dateTimeElement, this.data.publishedAt);

            this.dom.updateText(this.el.querySelector('.pd__info-media-title'), this.data.title);
            this.dom.updateText(this.el.querySelector('.pd__info-media-description'), this.dom.decodeHTML(this.data.description));

            if (Person.get() && (!Person.anon())) {
              this.appendChild(new CV.PostDetailActionsSave({
                  name : 'actionSave',
                  className : 'dark'
              })).render(this.actionsGroup).update(this.data);
            }

            this.appendChild(new CV.PostDetailActionsShare({
                name : 'actionShare',
                className : 'dark',
                tooltipPostition : 'top'
            })).render(this.actionsGroup).update(this.data);

            this.updateSaves(this.data);

            return this;
        },

        updateSaves : function updateSaves(data) {
            this.dom.updateText(this.savedElement, data.totalSaves || 0);
            return this;
        },

        _appendImage : function _appendImage(data) {
            this.headerElement.insertAdjacentHTML('afterbegin', '<img class="-fit" src="' + data.postImages.original.url + '"/>');
        },

        _appendVideo : function _appendVideo(data) {
            var id, iframe;

            this.headerElement.insertAdjacentHTML('afterbegin', this.constructor.IFRAME_STRING);
            iframe = this.headerElement.querySelector('iframe');

            if (data.sourceService === 'youtube') {
                // https://www.youtube.com/embed/Opktm709TJo
                id = data.sourceUrl.match(this.constructor.reYouTubeVideo)[1];
                this.dom.updateAttr('src', iframe, 'https://www.youtube.com/embed/' + id + '?autoplay=1');
            }

            if (data.sourceService === 'vimeo') {
                // https://player.vimeo.com/video/20729832?title=0&byline=0&portrait=0
                id = data.sourceUrl.match(this.constructor.reVimeoVideo)[0];
                this.dom.updateAttr('src', iframe, 'https://player.vimeo.com/video/' + id + '?autoplay=1');
            }

            id = iframe = null;
        }
    }
});

