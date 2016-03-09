var moment = require('moment');

Class(CV, 'VoicePostIndicator').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'cv-voice-tick-indicator',

  /* Holds the `y` values that are being registed by any instance.
   * This allows us to increase the y position of any indicator that will
   * overlap with any other.
   */
  registeredYValues : [],

  ITEM_OVERLAP_DISTANCE : 20,

  flushRegisteredYValues : function flushRegisteredYValues() {
    this.registeredYValues = [];
  },

  prototype : {
    /* @param {Object} config - the widget’s configuration settings.
     * @property {NodeElement} refElement - the post NodeElement related with this instance.
     * @property {number} zIndex - the zIndex for the instance.
     */
    init : function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.labelElement = this.el.querySelector('.cv-voice-tick-indicator-label');
      this.el.dataset.date = this.label;
      this.el.dataset.timestamp = moment(this.label).format('x') * 1000;
    },

    /* Sets the indicator position and dimensions.
     * Checks if the indicator can be positioned on the same y coord of
     * its CONFIG.refElement reference. This is to avoid collisions with
     * previous indicators. If it cannot be placed on that coord, its
     * `y` position will be calculated summing up its height to the last
     * `y` registed value.
     * @public
     */
    updatePosition : function updatePosition() {
      var y = 0, height = 0, alreadyRegistered, _that;

      _that = this;
      if (this.refElement.offsetParent) {
        y = ~~this.refElement.dataset.y || this.refElement.offsetTop;
        height = ~~this.refElement.dataset.h || this.refElement.offsetHeight;
      }

      alreadyRegistered = function(value) {
        return (value === y || y < (value + this.constructor.ITEM_OVERLAP_DISTANCE));
      }.bind(this);

      if (this.constructor.registeredYValues.some(alreadyRegistered)) {
        y = (this._getLastYValue() + this.constructor.ITEM_OVERLAP_DISTANCE);
      }

      this.constructor.registeredYValues.push(y);

      this.el.style.height = height + 'px';
      this.el.style.top = y + 'px';

      return this;
    },

    /* Sets the zIndex to the element instance.
     * @public
     */
    addIndex : function addIndex() {
      this.el.style.zIndex = this.zIndex;
    },

    /* Sets the zIndex to the element instance.
     * @public
     */
    removeIndex : function removeIndex() {
      this.el.style.zIndex = 'initial';
    },

    /* Returns its date as timestamp
     * @public
     */
    getTimestamp : function getTimestamp() {
      return this.el.dataset.timestamp;
    },

    /* Returns the last (which is the greatest) registered y value.
     * @private
     */
    _getLastYValue : function _getLastYValue() {
      return this.constructor.registeredYValues[this.constructor.registeredYValues.length - 1];
    },

    destroy : function destroy() {
      Widget.prototype.destroy.call(this);

      this.constructor.flushRegisteredYValues();

      this.label = null;
      this.refElement = null;
      this.zIndex = null;

      this.el = null;
      this.labelElement = null;
    }
  }
});
