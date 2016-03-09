/* jshint multistr: true */
Class(CV, 'PostCreatorFromUrlSourceIcons').inherits(Widget)({

    ELEMENT_CLASS : 'from-url-source-icons',

    HTML : '\
        <div>\
            <svg class="input-error-icon -on-error -abs -color-negative">\
                <use xlink:href="#svg-circle-x"></use>\
            </svg>\
            <div class="from-url-type image ui-has-tooltip" data-type="image">\
                <svg class="type-svg"><use xlink:href="#svg-image"></use></svg>\
                <span class="ui-tooltip -bottom">Enter the URL of an image you want to display</span>\
            </div>\
            <div class="from-url-type video ui-has-tooltip" data-type="video">\
                <svg class="type-svg"><use xlink:href="#svg-video"></use></svg>\
                <span class="ui-tooltip -bottom">Enter the URL of a Youtube or Vimeo video you want to display</span>\
            </div>\
            <div class="from-url-type link ui-has-tooltip" data-type="link">\
                <svg class="type-svg"><use xlink:href="#svg-article"></use></svg>\
                <span class="ui-tooltip -bottom">Enter the URL of a web page you want to display</span>\
            </div>\
        </div>\
    ',

    prototype : {
        init : function init(config)  {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.icons = [].slice.call(this.el.getElementsByClassName('from-url-type'), 0);
        },

        /* Sets the active class selector to the icon that matches the passed type argument.
         * @method activateIcon <public> [Function]
         */
        activateIcon : function activateIcon(type) {
            this.icons.some(function(icon) {
                if (icon.getAttribute('data-type') === type) {
                    icon.classList.add('active');
                    return true;
                }
            });
        },

        /* Remove the active class to all icons.
         * @method deactivateIcons <public> [Function]
         */
        deactivateIcons : function deactivateIcons() {
            this.icons.forEach(function(icon) {
                icon.classList.remove('active');
            });
        }
    }
});

