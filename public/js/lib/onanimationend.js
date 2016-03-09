var s = document.body || document.documentElement, s = s.style;
var prefixAnimation = '';

if (s.WebkitAnimation === '') prefixAnimation = '-webkit-';
if (s.MozAnimation === '') prefixAnimation = '-moz-';
if (s.OAnimation === '') prefixAnimation = '-o-';

module.exports = function(el, callback) {
    var runOnce = function (e) {
        el.removeEventListener('webkitAnimationEnd', runOnce);
        el.removeEventListener('mozAnimationEnd', runOnce);
        el.removeEventListener('oAnimationEnd', runOnce);
        el.removeEventListener('oanimationend', runOnce);
        el.removeEventListener('animationend', runOnce);
        callback();
    };

    el.addEventListener('webkitAnimationEnd', runOnce);
    el.addEventListener('mozAnimationEnd', runOnce);
    el.addEventListener('oAnimationEnd', runOnce);
    el.addEventListener('oanimationend', runOnce);
    el.addEventListener('animationend', runOnce);

    if (getComputedStyle(el)[prefixAnimation + 'animation-duration'] == '0s') {
        callback();
    }
};
