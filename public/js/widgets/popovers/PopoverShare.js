var Events = require('./../../lib/events');
var Checkit = require('checkit');
var ShareUrl = require('share-url');

Class(CV, 'PopoverShare').inherits(Widget).includes(CV.WidgetUtils)({
    HTML : '\
        <div class="ui-vertical-list hoverable">\
            <a class="ui-vertical-list-item -block -tdn" target="_blank" data-type="twitter" title="Share on Twitter">\
                <svg class="-s20 -mr1">\
                    <use xlink:href="#svg-twitter-square"></use>\
                </svg>\
                Twitter\
            </a>\
            <a class="ui-vertical-list-item -block -tdn" target="_blank" data-type="facebook" title="Share on Facebook">\
                <svg class="-s20 -mr1">\
                    <use xlink:href="#svg-facebook-square"></use>\
                </svg>\
                Facebook\
            </a>\
            <a class="ui-vertical-list-item -block -tdn" target="_blank" data-type="googleplus" title="Share on Google+">\
                <svg class="-s20 -mr1">\
                    <use xlink:href="#svg-gplus-square"></use>\
                </svg>\
                Google Plus\
            </a>\
            <div class="share-popover-email-box -clearfix">\
                <svg class="-s20 -float-left">\
                    <use xlink:href="#svg-email-square"></use>\
                </svg>\
                <button class="cv-button tiny -float-right" data-button="send-email">Share</button>\
                <div class="cv-input -overflow-hidden">\
                    <input placeholder="Enter email here to share" data-input="email"/>\
                </div>\
            </div>\
        </div>\
    ',

    prototype : {
        data : {
            url : null,
            title : ''
        },

        _checkit : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.fa = this.el.querySelector('[data-type="facebook"]');
            this.tw = this.el.querySelector('[data-type="twitter"]');
            this.gp = this.el.querySelector('[data-type="googleplus"]');
            this.emailInputWrapper = this.el.querySelector('.cv-input');
            this.emailInput = this.el.querySelector('[data-input="email"]');
            this.sendEmailButton = this.el.querySelector('[data-button="send-email"]');

            this._checkit = new Checkit({
                email : ['required', 'email']
            });

            this.update(this.data)._bindEvents();
        },

        update : function update(data) {
            this.data = data;
            this.dom.updateAttr('href', this.fa, ShareUrl.facebook({u: this.data.url}));
            this.dom.updateAttr('href', this.tw, ShareUrl.twitter({url: this.data.url, text: this.data.title}));
            this.dom.updateAttr('href', this.gp, ShareUrl.googlePlus({url: this.data.url}));
            return this;
        },

        _bindEvents : function _bindEvents() {
            this._beforeEmailSendRef = this._beforeEmailSend.bind(this);
            Events.on(this.sendEmailButton, 'click', this._beforeEmailSendRef);

            this._keyupHandlerRef = this._keyupHandler.bind(this);
            Events.on(this.emailInput, 'keyup', this._keyupHandlerRef);

            return this;
        },

        _beforeEmailSend : function _beforeEmailSend() {
            var checkResult = this._checkit.runSync({
                email : this.emailInput.value
            });

            if (checkResult[0]) {
                return this.emailInputWrapper.classList.add('error');
            }

            var emailUrlString = ShareUrl.email({
                to : this.emailInput.value,
                subject : 'Check out this at CrowdVoice.by',
                body : this.data.title + '\n' + this.data.url
            });

            window.location = emailUrlString;
        },

        _keyupHandler : function _keyupHandler() {
            this.emailInputWrapper.classList.remove('error');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            Events.off(this.sendEmailButton, 'click', this._beforeEmailSendRef);
            this._beforeEmailSendRef = null;

            Events.off(this.emailInput, 'keyup', this._keyupHandlerRef);
            this._keyupHandlerRef = null;

            return null;
        }
    }
});
