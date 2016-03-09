var inlineStyle = require('./../lib/inline-style');
var transitionEnd = require('../lib/ontransitionend');

Class(CV, 'Loading').inherits(Widget)({
  HTML: '\
    <div class="cv-loading">\
      <div class="uil-ripple-css">\
        <div></div>\
        <div></div>\
      </div>\
    </div>',

  prototype: {
    size: 56,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      this.setSize(this.size);
    },

    /* @public
     * @return Loading
     */
    setSize: function setSize(pixelSize) {
      var size = this._scale(pixelSize);
      var transform = 'scale('+ size +')';

      inlineStyle(this.el, {
        msTransform: transform,
        webkitTransform: transform,
        transform: transform,
      });

      return this;
    },

    /* @public
     * @return Loading
     */
    center: function center() {
      var transform = 'translate(-50%, -50%) scale('+ this._scale(this.size) +')';

      inlineStyle(this.el, {
        position: 'absolute',
        top: '50%',
        left: '50%',
        msTransform: transform,
        webkitTransform: transform,
        transform: transform,
      });

      return this;
    },

    /* @public
     * @return Loading
     */
    setStyle: function setStyle(styles) {
      Object.keys(styles).forEach(function(propertyName) {
        this.el.style[propertyName] = styles[propertyName];
      }, this);

      return this;
    },

    /* Returns the scaled value of the loader size.
     * @param {number} pixels - the loader’s size in pixels.
     * @private
     * @return {number} the scaled value.
     */
    _scale: function _scale(pixels) {
      return ((pixels * 100 / 200) / 100);
    },

    /* Waits for the animation to finish then remove the element from the DOM
     * calling its `destroy` method.
     * @public
     */
    remove: function remove() {
      var _this = this;

      function callback() {
        _this.destroy();
      }

      transitionEnd(this.el, callback);
      return null;
    }
  }
});
