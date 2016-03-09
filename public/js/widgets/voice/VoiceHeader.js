var Events = require('./../../lib/events');
var inlineStyle = require('./../../lib/inline-style');

Class(CV, 'VoiceHeader').inherits(Widget)({
    prototype : {
        el : null,
        backgroundElement : null,
        footerVoiceTitle : null,
        scrollableArea : window,

        HEADER_HEIGHT : 0,
        TITLE_OFF_PAGE : 0,
        DELTA : 5,
        backgroundElementHeigth : 0,
        backgroundElementHeigth2x : 0,
        _backgroundSizeKnow : false,
        _lastScrollTop : 0,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element;
            this._body = document.body;
            this._window = window;
            this.HEADER_HEIGHT = this.el.offsetHeight;
            this.TITLE_OFF_PAGE = this.HEADER_HEIGHT + document.querySelector('.voice-heading').offsetHeight;
            this.backgroundElementHeigth = this.backgroundElement.offsetHeight;
            this._bindEvents();
        },

        /* Subscribe to the scroll event to show/hide the header nav.
         * @method _bindEvents <private> [Function]
         * @return [CV.Header]
         */
        _bindEvents : function _bindEvents() {
            this._scrollHandlerRef = this._scrollHandler.bind(this);
            Events.on(this.scrollableArea, 'scroll', this._scrollHandlerRef);

            var backgroundImage = this.backgroundElement.getElementsByTagName('img')[0];
            if (backgroundImage) {
                Events.once(backgroundImage, 'load', function(ev) {
                    this.backgroundElementHeigth = ev.currentTarget.clientHeight;
                    this.backgroundElementHeigth2x = (this.backgroundElementHeigth * 2);
                    this._backgroundSizeKnow = true;
                }.bind(this));
            } else {
                this._backgroundSizeKnow = true;
            }

            return this;
        },

        /* Handle the scroll event.
         * @method _scrollHandler <private> [Function]
         */
        _scrollHandler : function _scrollHandler() {
            var y = this._window.pageYOffset;
            var scrollingDown = (y > this._lastScrollTop);

            if (this._backgroundSizeKnow) {
                if (y <= this.backgroundElementHeigth2x) {
                    var yHalf = (y/2);
                    inlineStyle(this.backgroundElement, {
                        msTransform: 'translate(0px, '+ yHalf +'px)',
                        webkitTransform: 'translate(0px, '+ yHalf +'px)',
                        transform: 'translate3d(0px, '+ yHalf +'px,0)'
                    });
                }
            }

            if (Math.abs(this._lastScrollTop - y) <= this.DELTA) { return; }

            this._lastScrollTop = y;

            if (scrollingDown) {
                this.el.classList.add('hide');

                if (y > this.TITLE_OFF_PAGE) {
                    this.footerVoiceTitle.classList.add('active');
                }
                return;
            }

            if (scrollingDown === false) {
                this.el.classList.remove('hide');

                if (y < this.HEADER_HEIGHT) {
                    this.footerVoiceTitle.classList.remove('active');
                }

                this._lastScrollTop = y;
            }
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.off(this.scrollableArea, 'scroll', this._scrollHandlerRef);
            this._scrollHandlerRef = null;
            return null;
        }
    }
});
