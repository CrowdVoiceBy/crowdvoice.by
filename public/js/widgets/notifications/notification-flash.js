/* jshint multistr: true */
Class(CV, 'NotificationFlash').inherits(CV.Notification)({
    ELEMENT_CLASS : 'cv-notification changed-avatar',
    HTML : '\
        <div>\
            <div class="cv-notification__info -is-link">\
                <div class="cv-notification__info-main">\
                    <p class="main-text"></p>\
                </div>\
            </div>\
        </div>\
    ',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.mainAvatarElement = this.el.querySelector('.main-avatar');
            this.mainText = this.el.querySelector('.main-text');

            this.mainText.innerHTML = '<h4>' + this.text + '</h4>';

        }
    }
});
