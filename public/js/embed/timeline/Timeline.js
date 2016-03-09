Class(CV, 'Timeline').inherits(Widget)({
  HTML : '\
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

  prototype : {
    init : function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.clockWrapper = this.el.querySelector('.cv-voice-timeline-feedback');
    },

    /* Sets the initial position of the progress feedback.
     * Activate itself so it became visible to interact with.
     * @public
     * @param {number} px - the x position for the initial feedback scaled to pixels.
     */
    run : function run (px) {
      this.update(px);
      this.enable();
      return this;
    },

    /* Updates the feedback progress x position.
     * @public
     * @param {number} px - the x position scaled to pixels.
     */
    update : function update (px) {
      var translate = 'translateX(' + px + 'px)';
      this.clockWrapper.style.webkitTransform = translate;
      this.clockWrapper.style.msTransform = translate;
      this.clockWrapper.style.transform = translate;
      return this;
    },

    /* Sets the main progress bar color.
     * Useful to accept dynamic color values depending on the embeddable configuration.
     * @public
     */
    updateBgColor : function updateBgColor (color) {
      this.clockWrapper.style.backgroundColor = color;
      return this;
    }
  }
});
