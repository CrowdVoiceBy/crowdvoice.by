/* jshint multistr: true */
var moment = require('moment');

Class(CV, 'PostAudio').inherits(CV.Post)({
    HTML : '\
    <article class="post-card audio">\
        <div class="post-card-image-wrapper">\
            <img class="post-card-image"/>\
        </div>\
        <div class="post-card-audio-player-wrapper">\
            <div class="post-card-audio-player-progress-wrapper">\
                <div class="post-card-audio-player-progress"></div>\
            </div>\
            <button class="post-card-play-button -rel">\
                <svg class="post-card-svg-play">\
                    <use xlink:href="#svg-play"></use>\
                </svg>\
                <svg class="post-card-svg-pause">\
                    <use xlink:href="#svg-pause"></use>\
                </svg>\
            </button>\
            <div class="post-card-audio-player-text -rel">\
                <p class="init"><b>Listen</b> (<span class="post-card-audio-player-total-time-db">3:45</span>)</p>\
                <p class="loaded">\
                    <span class="post-card-audio-player-current-time">0:00</span>\
                    &nbsp;/\&nbsp;<span class="post-card-audio-player-total-time">0:00</span>\
                </p>\
            </div>\
        </div>\
        <div class="post-card-info">\
            <div class="post-card-meta">\
                <span class="post-card-meta-source"></span>\
                <time class="post-card-meta-date" datetime=""></time>\
            </div>\
            <h2 class="post-card-title"></h2>\
            <p class="post-card-description"></p>\
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

    ICON : '<svg class="post-card-meta-icon"><use xlink:href="#svg-speaker"></use></svg>',

    prototype : {

        /* PRIVATE properties */
        audio : null,
        el : null,
        imageWrapperElement : null,
        playButton : null,
        audioTotalTime : null,
        audioCurrentTime : null,
        playerProgressWrapper : null,
        playerProgress : null,
        sourceElement : null,
        dateTimeElement : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.imageWrapperElement = this.el.querySelector('.post-card-image-wrapper');
            this.playerWrapper = this.el.querySelector('.post-card-audio-player-wrapper');
            this.playButton = this.el.querySelector('.post-card-play-button');
            this.audioTotalTime = this.el.querySelector('.post-card-audio-player-total-time');
            this.audioCurrentTime = this.el.querySelector('.post-card-audio-player-current-time');
            this.playerProgressWrapper = this.el.querySelector('.post-card-audio-player-progress-wrapper');
            this.playerProgress = this.el.querySelector('.post-card-audio-player-progress');
            this.sourceElement = this.el.querySelector('.post-card-meta-source');
            this.dateTimeElement = this.el.querySelector('.post-card-meta-date');

            this.el.insertAdjacentHTML('beforeend', this.constructor.ACTIONS_HTML);

            if (this.image) {
                this.imageWrapperElement.style.height = this.imageHeight + 'px';
                this.imageWrapperElement.style.display = 'block';
            } else {
                this.imageLoaded = true;
            }

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

            this.dom.updateText(this.el.querySelector('.post-card-title'), this.title);
            this.dom.updateText(this.el.querySelector('.post-card-description'), this.description);

            this.dom.updateText(this.el.querySelector('.post-card-activity-saved .post-card-activity-label'), this.totalSaves);

            this.dom.updateText(this.el.querySelector('.post-card-audio-player-total-time-db'), this.audio_duration);

            this.audio = new CV.Audio(this.sourceUrl);

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this.playButton.addEventListener('click', this.togglePlayHandler.bind(this), false);
            this.playerProgressWrapper.addEventListener('mouseup', this.progressMouseup.bind(this), false);

            this.audio.bind('onload', function() {
                console.log('onload received :)');
                this.playerWrapper.classList.remove('-is-downloading');
                this.playerWrapper.classList.add('-is-loaded');
                this.dom.updateText(this.audioTotalTime, this.format.secondsToHHMMSS(this.audio.getDuration() / 1000));

                this._soundLoaded = true;
                this.togglePlayHandler();
            }.bind(this));

            this.audio.bind('whileplaying', function(data) {
                console.log('whileplaying received :)');
                var p = this.audio.getProgressPercentage();
                this.playerProgress.style.webkitTransform = 'translate3d(' + (p - 100) + '%, 0, 0)';
                this.playerProgress.style.transform = 'translate3d(' + (p - 100) + '%, 0, 0)';
                this.audioCurrentTime.textContent = this.format.secondsToHHMMSS(this.audio.getCurrentTime() / 1000);
            }.bind(this));

            this.audio.bind('onfinish', function(data) {
                this.audio.setPosition(0);
                this.togglePlayHandler();
            }.bind(this));

            return this;
        },

        progressMouseup : function(ev) {
            if (!this._soundLoaded) return;

            var cr, x, width, duration, newPosition;

            cr = ev.currentTarget.getBoundingClientRect();
            x = ev.pageX - cr.left;
            width = cr.width;
            duration = this.audio.getDuration();
            newPosition = ~~(x * duration / width);

            this.audio.setPosition(newPosition);

            cr = x = width = duration = newPosition = null;
        },

        _loadSound : function() {
            this.playerWrapper.classList.add('-is-downloading');
            this.audio.load();
        },

        _soundLoaded: false,
        togglePlayHandler : function togglePlayHandler() {
            if (this._soundLoaded === false) {
                return this._loadSound();
            }

            this.playerWrapper.classList.toggle('-is-playing');

            if (this.audio.paused) this.audio.play();
            else this.audio.pause();
        },

        /* Implementation for the destroy method.
         * This is run by the destroy method on CV.Post
         * @method __destroy <private> [Function]
         */
        __destroy : function __destroy() {
            this.audio = null;
            this.el = null;
            this.imageWrapperElement = null;
            this.playButton = null;
            this.audioTotalTime = null;
            this.audioCurrentTime = null;
            this.playerProgressWrapper = null;
            this.playerProgress = null;

            this.sourceElement = null;
            this.dateTimeElement = null;
        }

    }
});
