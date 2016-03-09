var moment = require('moment');
var Velocity = require('velocity-animate');
var Events = require('./../../../lib/events');

Class(CV, 'VoiceTimelineFeedback').inherits(Widget)({
  HTML: '\
    <div class="cv-voice-timeline-feedback-hitpoint disable -clickable">\
      <div class="cv-voice-timeline-feedback-wrapper -clickable">\
        <div class="cv-voice-timeline-feedback -clickable">\
          <div class="cv-voice-timeline-clock">\
            <span class="timeline-clock-h"></span>\
            <span class="timeline-clock-m"></span>\
          </div>\
        </div>\
      </div>\
    </div>',

  INDICATOR_CLASSNAME: 'cv-voice-tick-indicator',
  FOOTER_HEIGHT: 56,

  prototype : {
    /* CONFIGURATION OPTIONS */
    firstPostDate: '',
    lastPostDate: '',
    scrollableArea: null,

    /* PRIVATE : PROPERTIES */
    /* CONFIG.firstPostDate in milliseconds */
    _firstDateMS: '',
    /* CONFIG.lastPostDate in milliseconds */
    _lastDateMS: '',
    /* Holds the last value of window.scrollY */
    _lastScrollY: null,
    /* Flag to handle updates per screen update (raf) */
    _scheduledAnimationFrame: null,
    /* Holds the value in pixel units of total scrollable area */
    _totalHeight: 0,
    /* Holds the value in pixel units of the viewport width */
    _clientWidth: 0,
    /* Holds the value in pixel units of the viewport height */
    _clientHeight: 0,
    /* Random-ish value to alter the clock roration based on total height */
    _rotateFactor: 0,
    /* Offset left spacing for the clock available space */
    _timelineOffsetLeft: 0,
    /* Offset rigth spacing for the clock available space */
    _timelineOffsetRight: 0, /* value updated on setTimelineInitialDate method*/
    /* Holds the reference to the last date indicator detected */
    _lastScrollDate: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._window = window;
      this._body = document.body;
      this.clockWrapper = this.el.querySelector('.cv-voice-timeline-feedback');
      this._mainContent = document.getElementsByClassName('cv-main-content')[0];
      this.clockElement = this.el.querySelector('.cv-voice-timeline-clock');
      this.hourElement = this.el.querySelector('.timeline-clock-h');
      this.minutesElement = this.el.querySelector('.timeline-clock-m');

      this._firstDateMS = moment(this.firstPostDate).format('x') * 1000;
      this._lastDateMS = moment(this.lastPostDate).format('x') * 1000;

      this.updateVars()._bindEvents();
    },

    createJumpToDateBubble: function createJumpToDateBubble(postsCount) {
      this.appendChild(new CV.VoiceTimelineJumpToDate({
        name: 'jumpToDate',
        postsCount: postsCount,
        container: this.el
      })).render(this.el);
    },

    /* Subscribe and listen to events.
     * @method _bindEvents <private> [Function]
     */
    _bindEvents: function _bindEvents() {
      this.readAndUpdateRef = this._readAndUpdate.bind(this);

      this.scrollHandlerRef = this._scrollHandler.bind(this);
      Events.on(this.scrollableArea, 'scroll', this.scrollHandlerRef);

      this.resizeHandlerRef = this.updateVars.bind(this);
      Events.on(this._window, 'resize', this.resizeHandlerRef);

      return this;
    },

    /* Handle the window.scroll event
     * @method _scrollHandler <private> [Function]
     */
    _scrollHandler: function _scrollHandler() {
      this._lastScrollY = this._window.pageYOffset;

      if (this._scheduledAnimationFrame) {
        return void 0;
      }

      this._scheduledAnimationFrame = true;
      requestAnimationFrame(this.readAndUpdateRef);
    },

    /* Updates timeline feedback animation while scrolling.
     * @method _readAndUpdate <private> [Function]
     */
    _readAndUpdate: function _readAndUpdate() {
      var scrollPercentage, scrollViewportPixels, elem, scaledPercentage, scaledPixels;

      scrollPercentage = 100 * this._lastScrollY / (this._totalHeight - this._clientHeight);
      scrollViewportPixels = scrollPercentage * this._clientHeight / 100;
      elem = document.elementFromPoint(this._clientWidth - 20, scrollViewportPixels);

      if (elem) {
        if (elem.classList.contains(this.constructor.INDICATOR_CLASSNAME)) {
          this._lastScrollDate = elem.dataset.timestamp;
        }
      }

      scaledPercentage = ((100 * (this._lastScrollDate - this._firstDateMS)) / (this._lastDateMS - this._firstDateMS));

      if (scaledPercentage < 0) {
        scaledPercentage = 0;
      }

      scaledPixels = ~~((this._clientWidth - 74) * scaledPercentage / 100);

      Velocity(this.clockWrapper, 'stop', true);
      Velocity(this.clockWrapper, {
        translateX: scaledPixels + 'px'
      }, {
        duration: 200,
        easing: 'linear'
      });

      this._scheduledAnimationFrame = false;
    },

    /* Cache some variable values related to the screen size.
     * This method should be called on:
     *  - init
     *  - whenever the viewport changes its dimensions
     *  - whenever the CONFIG._mainContent change its length
     * @method updateVars <public> [Function]
     */
    updateVars: function updateVars() {
      this._totalHeight = this._mainContent.offsetHeight;
      this._clientWidth = document.documentElement.clientWidth;
      this._clientHeight = document.documentElement.clientHeight - this.constructor.FOOTER_HEIGHT;
      this._rotateFactor = this._totalHeight / 500;
      return this;
    },

    /* Sets the initial value for _lastScrollDate so the clock feedabck
     * can be started.
     * @method setInitialFeedbackDate <public> [Function]
     */
    setInitialFeedbackDate: function setInitialFeedbackDate(timestamp) {
      this._lastScrollDate = timestamp;
      // clock-width = 16 + 20 (padding)
      this._timelineOffsetRight = 16 + 20;
      this._readAndUpdate();
      this.enable();
    },

    activateJumpToDateOption: function activateJumpToDateOption(dateString) {
      this.jumpToDate.updateActivateOption(dateString);
    },

    /* Unlisten events, release any HTMLElement reference, free variables...
     * @method destroy <public> [Function]
     */
    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      Events.off(this.scrollableArea, 'scroll', this.scrollHandlerRef);
      this.scrollHandlerRef = null;
      Events.off(this._window, 'resize', this.resizeHandlerRef);
      this.resizeHandlerRef = null;
      return null;
    }
  }
});
