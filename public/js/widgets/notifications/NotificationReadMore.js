var Person = require('./../../lib/currentPerson');

Class(CV, 'NotificationReadMore').inherits(CV.Notification)({
    ELEMENT_CLASS : 'cv-notification read-more -text-center',
    HTML : '\
        <div>\
            <a class="cv-notification__info -m0 -block -font-bold -is-link">\
                See all notifications\
            </a>\
        </div>',

    prototype : {
        init : function init(config) {
            CV.Notification.prototype.init.call(this, config);
            this.element[0].querySelector('.cv-notification__info').setAttribute('href', '/' + Person.get().profileName + '/feed');
        }
    }
});
