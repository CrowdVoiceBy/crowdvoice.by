var API = require('./../../../lib/api');
var Person = require('./../../../lib/currentPerson');

Class(CV, 'CardActionFollow').inherits(Widget).includes(BubblingSupport)({
    ELEMENT_CLASS : 'card-actions-item card-actions-follow-button',

    HTML_FOLLOW : '\
        <svg class="card-activity-svg -s16">\
            <use xlink:href="#svg-user-follow"></use>\
        </svg>\
        <p class="card-actions-label">Follow</p>',

    HTML_FOLLOWING : '\
        <div class="following-button">\
            <svg class="card-activity-svg -s16">\
                <use xlink:href="#svg-user-following"></use>\
            </svg>\
            <p class="card-actions-label">Following</p>\
        </div>\
        <div class="unfollow-button">\
            <svg class="card-activity-svg -s16">\
                <use xlink:href="#svg-user-unfollow"></use>\
            </svg>\
            <p class="card-actions-label">Unfollow</p>\
        </div>',

    prototype : {
        /* Entity Model
         * @property entity <required> [EntityModel]
         */
        entity : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            if (this.entity.followed === true) {
                this._setIsFollowing();
            } else {
                this._setIsNotFollowing();
            }

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            this.el.addEventListener('click', this._clickHandlerRef);

            return this;
        },

        /* Set button state as if currentPerson is following this Entity
         * @method _setIsFollowing <private> [Function]
         */
        _setIsFollowing : function _setIsFollowing() {
            this.entity.followed = true;
            this.el.innerHTML = '';
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_FOLLOWING);

            this.appendChild(new CV.CardUnfollowPopover({
                name : 'unfollowPopoverContent'
            }));

            this.appendChild(new CV.PopoverBlocker({
                name : 'unfollowPopover',
                className : 'unfollow-popover',
                placement : 'top',
                content : this.unfollowPopoverContent.el
            })).render(this.el);

            this.unfollowPopoverContent.bind('unfollow', this._unfollowHandlerRef.bind(this));
            this.unfollowPopoverContent.bind('cancel', this._cancelHandlerRef.bind(this));

            this.unfollowPopover.bind('activate', this.activate.bind(this));
            this.unfollowPopover.bind('deactivate', this.deactivate.bind(this));
            this.unfollowPopover.bind('destroy', this.deactivate.bind(this));

            return this;
        },

        /* Set button state as if currentPerson is not following this Entity
         * @method _setIsNotFollowing <private> [Function]
         */
        _setIsNotFollowing : function _setIsNotFollowing() {
            this.entity.followed = false;

            if (this.unfollowPopover) {
                this.unfollowPopover = this.unfollowPopover.deactivate().destroy();
            }

            if (this.unfollowPopoverContent) {
                this.unfollowPopoverContent = this.unfollowPopoverContent.destroy();
            }

            this.el.innerHTML = '';
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_FOLLOW);

            return this;
        },

        /* Click Button Handler. Is in charge of calling the follow API.
         * @method _clickHandler <private> [Function]
         */
        _clickHandler : function _clickHandler() {
            if (this.entity.followed === true) {
                // wants to unfollow? you need to confirm first.
                this.unfollowPopover.activate();
                return undefined;
            }

            this._followHandler();
        },

        /* Sets the button state as following plus call the follow API
         * @method _followHandler <private> [Function]
         */
        _followHandler : function _followHandler() {
            this._setIsFollowing()._cancelHoverState();

            API.followEntity({
                profileName: this.entity.profileName,
                data : {followerId : Person.get().id}
            }, function(err) {
                if (err) {
                    this._setIsNotFollowing();
                }
            }.bind(this));
        },

        /* Sets the button state as not following plus call the follow API
         * @method _unfollowHandlerRef <private> [Function]
         */
        _unfollowHandlerRef : function _unfollowHandlerRef() {
            this._setIsNotFollowing();

            API.followEntity({
                profileName: this.entity.profileName,
                data : {followerId : Person.get().id}
            }, function(err) {
                if (err) {
                    this._setIsFollowing();
                }
            }.bind(this));
        },

        _cancelHandlerRef : function _cancelHandlerRef() {
            this.unfollowPopover.deactivate();
        },

        /* Adds a class selector that prevent the hover effect for this particular button via CSS.
         * This is important for UX, because when a user has just followed this Entity we should NOT shown the 'unfollow' state of the button on hover over.
         * When the user move the mouse out of the button this class selector is removed, so when she hover over the button again then we can show the 'unfollow' button state.
         */
        _cancelHoverState : function _cancelHoverState() {
            var _this = this;

            this.el.classList.add('cancel-hover-state');

            var mouseLeave = function mouseLeave() {
                _this.el.classList.remove('cancel-hover-state');
                _this.el.removeEventListener('mouseleave', mouseLeave);
            };

            this.el.addEventListener('mouseleave', mouseLeave);
        },

        _activate : function _activate() {
            Widget.prototype._activate.call(this);
            this.dispatch('card:action:popover:active');
        },

        _deactivate : function _deactivate() {
            Widget.prototype._deactivate.call(this);
            this.dispatch('card:action:popover:deactive');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            this.el.removeEventListener('click', this._clickHandlerRef);
            this._clickHandlerRef = null;
            return null;
        }
    }
});
