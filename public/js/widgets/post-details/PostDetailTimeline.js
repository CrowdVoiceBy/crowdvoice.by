var moment = require('moment');
var Events = require('./../../lib/events');

Class(CV, 'PostDetailTimeline').inherits(Widget)({
    HTML : '\
        <div class="cv-post-detail-timeline-wrapper">\
            <div class="cv-post-detail-timeline-feedback"></div>\
        </div>',
    prototype : {
        firstPostDate : '',
        lastPostDate : '',

        _currentPost : null,
        _clientWidth : 0,

        /* @param {string} config.firstPostDate - voice’s first post timestamp
         * @param {string} config.lastPostDate - voice’s last post timestamp
         */
        init: function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.feedback = this.el.querySelector('.cv-post-detail-timeline-feedback');

            this._firstDateMS = moment(this.firstPostDate).format('x') * 1000;
            this._lastDateMS = moment(this.lastPostDate).format('x') * 1000;

            this._updateVars()._bindEvents();
        },

        /* Update the feedback indicator position using the Post.publishedAt value.
         * @public
         * @param {Object} post - current active post on the detail view
         */
        update : function update(post) {
            var currentDateMs = moment(post.publishedAt).format('x') * 1000;
            var percent = (100 * (currentDateMs - this._firstDateMS)) / (this._lastDateMS - this._firstDateMS);
            var pixels = ~~(this._clientWidth * percent / 100);
            var transform = 'translateX(' + pixels + 'px)';

            this.feedback.style.msTransform = transform;
            this.feedback.style.webkitTransform = transform;
            this.feedback.style.transform = transform;
            this._currentPost = post;
        },

        _bindEvents : function _bindEvents() {
            this._updateVarsRef = this._updateVars.bind(this);
            Events.on(window, 'resize', this._updateVarsRef);
            return this;
        },

        _updateVars : function _updateVars() {
            this._clientWidth = (window.innerWidth - 15);

            if (this._currentPost) {
                this.update(this._currentPost);
            }

            return this;
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.off(window, 'resize', this._updateVarsRef);
            this._updateVarsRef = null;
            return null;
        }
    }
});