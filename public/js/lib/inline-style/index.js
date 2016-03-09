// var _re = {
//     camelCase : new RegExp("[A-Z]\\w+")
// };

// function _toDash(string) {
//     return string.replace(/([A-Z])/g, function(letter) {
//         return '-' + letter.toLowerCase();
//     });
// }

module.exports = function(el, styles) {
    Object.keys(styles).forEach(function(propertyName) {
        // if (_re.camelCase.test(propertyName) === true) {
        //     propertyName = _toDash(propertyName);
        // }

        el.style[propertyName] = styles[propertyName];
    });
};
