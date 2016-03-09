/* jshint multistr: true */
var moment = require('moment');

Class(CV, 'PostQuote').inherits(CV.Post)({
    HTML : '\
    <article class="post-card quote">\
        <div class="post-card-info">\
            <div class="post-card-meta">\
                <span class="post-card-meta-source"></span>\
                <time class="post-card-meta-date" datetime=""></time>\
            </div>\
            <p class="post-card-quote"></p>\
            <p class="post-card-quote-author"></p>\
            <div class="post-card-activity">\
                <div class="post-card-activity-saved -inline-block">\
                    <svg class="post-card-activity-svg">\
                        <use xlink:href="#svg-save-outline"></use>\
                    </svg>\
                    <span class="post-card-activity-label">0</span>\
                </div>\
            </div>\
        </div>\
    </article>\
    ',

    ICON : '<svg class="post-card-meta-icon"><use xlink:href="#svg-repost"></use></svg>',

    prototype : {

        /* PRIVATE properties, inherited from Post */
        imageLoaded : true,

        /* PRIVATE properties */
        el : null,
        sourceElement : null,
        dateTimeElement : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.sourceElement = this.el.querySelector('.post-card-meta-source');
            this.dateTimeElement = this.el.querySelector('.post-card-meta-date');

            this.el.insertAdjacentHTML('beforeend', this.constructor.ACTIONS_HTML);

            if (this.sourceUrl && this.sourceService) {
                var a = document.createElement('a');
                this.dom.updateAttr('href', a, this.sourceUrl);
                this.dom.updateText(a, this.sourceService + " ");
                this.dom.updateText(this.sourceElement, 'from ');
                this.sourceElement.appendChild(a);
            } else {
                this.el.querySelector('.post-card-meta').insertAdjacentHTML('afterbegin', this.constructor.ICON);
                this.dom.updateText(this.sourceElement, 'posted ');
            }

            this.dom.updateText(this.dateTimeElement, "on " + moment(this.createdAt).format('MMM DD, YYYY'));
            this.dom.updateAttr('datetime', this.dateTimeElement, this.createdAt);

            this.dom.updateText(this.el.querySelector('.post-card-quote'), this.title);
            this.dom.updateText(this.el.querySelector('.post-card-quote-author'), this.description);

            this.dom.updateText(this.el.querySelector('.post-card-activity-saved .post-card-activity-label'), this.totalSaves);
        },

        /* Implementation for the destroy method.
         * This is run by the destroy method on CV.Post
         * @method __destroy <private> [Function]
         */
        __destroy : function __destroy() {
            this.el = null;
            this.sourceElement = null;
            this.dateTimeElement = null;
        }
    }
});
