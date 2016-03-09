/* global App */
var Events = require('./../../lib/events');
var Person = require('./../../lib/currentPerson');

Class(CV, 'MyVoicesOnboarding').inherits(Widget)({
    HTML : '\
        <section class="my-voices-onboarding profile-onboarding -rel">\
            <h1>Raise your Voice!</h1>\
            <p>You have no Voices yet. But don\'t worry, it is never too late! Create a Voice to support a cause that matters to you! Have people contribute to create and moderate it\'s content and embed it to amplify your message through the web.</p>\
        </section>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            this.appendChild(new CV.UI.Button({
                name : 'buttonCreate',
                className : 'my-voices-onboarding-cta primary -mb4',
                data : {value : 'Create Voice'}
            })).render(this.el);

            Events.on(this.buttonCreate.el, 'click', function() {
                App.showVoiceCreateModal({
                    ownerEntity : Person.get()
                });
            });
        },
    }
});
