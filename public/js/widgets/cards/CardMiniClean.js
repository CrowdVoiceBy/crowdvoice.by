/* Mini Card Clean Widget.
 * @argument data.person <required> [Object]
 */

var moment = require('moment');
var PLACEHOLDERS = require('./../../lib/placeholders');
var Events = require('./../../lib/events');

Class(CV, 'CardMiniClean').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
    ELEMENT_CLASS : 'card-mini -rel',

    HTML : '\
        <article role="article">\
            <img class="card-mini-avatar -color-bg-neutral-x-light -rounded -float-left" alt="{{person.full_name}}’s avatar image" width="36" height="36"/>\
            <div class="card-mini-info">\
                <div>\
                    <p class="card-mini-fullname -font-semi-bold -tdn"></p>\
                    <p class="card-mini-username"></p>\
                </div>\
            </div>\
            <div class="action -abs"></div>\
        </article>',

    META_HTML : '\
        <div class="card-info-meta">\
            <span data="location"></span>\
            <span data="joined-at"></span>\
        </div>',

    prototype : {
        _actions : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.avatarElement = this.el.querySelector('.card-mini-avatar');
            this.fullNameElement = this.el.querySelector('.card-mini-fullname');
            this.usernameElement = this.el.querySelector('.card-mini-username');
            this.actionsElement = this.el.querySelector('.action');
            this._actions = [];

            this._setup();
        },

        /* Replace the widget contents with the config received on config.
         * @method _setup <private> [Function]
         */
        _setup : function _setup() {
            if (this.data.images && this.data.images.small && this.data.images.small.url) {
                this.dom.updateAttr('src', this.avatarElement, this.data.images.small.url);
            } else {
                this.dom.updateAttr('src', this.avatarElement, PLACEHOLDERS.small);
            }

            this.dom.updateAttr('alt', this.avatarElement, this.data.profileName + "’s avatar image");
            this.dom.updateText(this.fullNameElement, this.data.name);

            this.dom.updateText(this.usernameElement, "@" + this.data.profileName);

            return this;
        },

        /* Show the location, joined at and inline name, username
         * @method showMeta <public> [Function]
         */
        showMeta : function showMeta() {
            this.el.classList.add('has-meta');
            this.usernameElement.insertAdjacentHTML('afterbegin', ' · ');

            this.el.querySelector('.card-mini-info').insertAdjacentHTML('beforeend', this.constructor.META_HTML);

            if (this.data.location) {
                this.dom.updateText(this.el.querySelector('[data="location"]'), this.data.location + ' · ');
            }

            this.dom.updateText(
                this.el.querySelector('[data="joined-at"]'),
                'Joined on ' + moment(this.data.createdAt).format('MMM, YYYY')
            );
        },

        addButtonAction : function addButtonAction(data) {
            if (this.children[data.name]) {
                console.warn('Generic action button, name already defined.');
                return this;
            }

            this._actions.push(data);

            this.appendChild(new CV.UI.Button({
                name : data.name,
                className : data.className,
                data : {value: data.value}
            })).render(this.actionsElement);

            Events.on(this[data.name].el, 'click', this._dispatchActionEvent.bind(this, data));
            return this;
        },

        _dispatchActionEvent : function _dispatchActionEvent(data) {
            if (this._actions.indexOf(data) >= 0) {
                this.dispatch(data.eventName, {data: this});
            }
        }
    }
});
