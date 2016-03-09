var s = document.body || document.documentElement, s = s.style;
var prefixTransition = '';

if (s.WebkitTransition === '') prefixTransition = '-webkit-';
if (s.MozTransition === '') prefixTransition = '-moz-';
if (s.OTransition === '') prefixTransition = '-o-';

module.exports = function(el, callback) {
    var runOnce = function runOnce(e) {
        el.removeEventListener('webkitTransitionEnd', runOnce);
        el.removeEventListener('mozTransitionEnd', runOnce);
        el.removeEventListener('oTransitionEnd', runOnce);
        el.removeEventListener('transitionend', runOnce);
        el.removeEventListener('transitionend', runOnce);
        callback();
    };

    el.addEventListener('webkitTransitionEnd', runOnce);
    el.addEventListener('mozTransitionEnd', runOnce);
    el.addEventListener('oTransitionEnd', runOnce);
    el.addEventListener('transitionend', runOnce);
    el.addEventListener('transitionend', runOnce);

    if (prefixTransition === '' && !('transition' in s)) {
        callback();
    }
};
