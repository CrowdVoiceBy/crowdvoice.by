/*
scrollto(nodeElement, {
    x : 0,
    y : ~~el.getBoundingClientRect().top,
    duration : 500,
    onComplete : function() {}
});
*/

var TWEEN = require('tween.js');
var raf = require('raf');

function _scroll(element) {
    var x, y;

    if (element.scrollTo) {
        x = element.pageXOffset;
        y = element.pageYOffset;
    } else {
        x = element.scrollLeft;
        y = element.scrollTop;
    }

    return {y: y, x: x};
}

module.exports = function scrollTo(element, options) {
    options = options || {};

    var start = _scroll(element);

    var tween = new TWEEN.Tween(start)
    .easing(options.easing || TWEEN.Easing.Circular.Out)
    .to({x: options.x, y: options.y}, options.duration || 300)
    .onUpdate(function() {
        var x = this.x | 0;
        var y = this.y | 0;

        if (element.scrollTo) {
            element.scrollTo(x, y);
            return;
        }

        element.scrollLeft = x;
        element.scrollTop = y;
    })
    .onComplete(function() {
        animate = function(){};
        options.onComplete && options.onComplete();
    })
    .start();

    function animate() {
        raf(animate);
        TWEEN.update();
    }

    animate();

    return tween;
};
