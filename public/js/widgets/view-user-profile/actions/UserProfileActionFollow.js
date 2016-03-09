var API = require('./../../../lib/api');
var Person = require('./../../../lib/currentPerson');
var Events = require('./../../../lib/events');

Class(CV, 'UserProfileActionFollow').inherits(CV.UI.Button)({
    prototype : {
        /* Entity Model
         * @property entity <required> [EntityModel]
         */
        entity : null,

        init : function init(config) {
            CV.UI.Button.prototype.init.call(this, config);

            if (this.entity.followed) {
                this._setIsFollowing();
            } else {
                this._setIsNotFollowing();
            }

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.el, 'click', this._clickHandlerRef);
            return this;
        },

        _clickHandler : function _clickHandler() {
            this.disable();

            API.followEntity({
                profileName: this.entity.profileName,
                data : {followerId : Person.get().id}
            }, function(err, res) {
                this.enable();

                if (err) {
                    return;
                }

                if (res.status === 'followed') {
                    this.entity.followed = true;
                    this._setIsFollowing();
                }

                if (res.status === 'unfollowed') {
                    this.entity.followed = false;
                    this._setIsNotFollowing();
                }
            }.bind(this));
        },

        _setIsFollowing : function _setIsFollowing() {
            this.updateHTML('\
                <svg class="-s14 -vam">\
                    <use xlink:href="#svg-checkmark"></use>\
                </svg> Following');
        },

        _setIsNotFollowing : function _setIsNotFollowing() {
            this.updateText('Follow');
        }
    }
});
