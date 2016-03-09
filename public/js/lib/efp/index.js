// https://github.com/amasad/debug_utils

// var Syringe = require('syringe.js');

(function() {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    // var RADIUS = 6;
    var PI_TWO = 2 * Math.PI;
    var W, H;

    function setSize() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    setSize();

    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.zIndex = '1000';
    canvas.style.pointerEvents = 'none';

    document.body.appendChild(canvas);

    window.addEventListener('resize', setSize);

    var COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];
    var colorsLen = COLORS.length;

    function draw(x, y) {
        // ctx.clearRect(0,0,W,H);
        ctx.beginPath();
        ctx.arc(x, y, getRandomInt(1, 10), 0, PI_TWO, false);
        ctx.fillStyle = COLORS[Math.floor(Math.random()*colorsLen)];
        ctx.fill();
        ctx.closePath();
    }

    var efp = function (object, methodName) {
        var method = object[methodName];

        var replacement = function replacement() {
            draw(arguments[0], arguments[1]);
            return method.apply(this, [].slice.call(arguments));
        };

        object[methodName] = replacement;
    };

    module.exports = efp(document, 'elementFromPoint');
})();
