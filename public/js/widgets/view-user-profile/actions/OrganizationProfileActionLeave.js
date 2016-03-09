var Person = require('./../../../lib/currentPerson');
var API = require('./../../../lib/api');
var Events = require('./../../../lib/events');

Class(CV, 'OrganizationProfileActionLeave').inherits(Widget)({
    HTML : '\
        <div class="profile-member-of-msg -nw -color-neutral-mid">\
            <svg class="profile-member-of-msg__svg -s12">\
                <use xlink:href="#svg-checkmark"></use>\
            </svg>\
            <span class="profile-member-of-msg__text">\
                You are a member of this organization.\
            </span>\
            <a href="#" data-leave-btn>Leave</a>\
            <div class="profile-member-of-msg__spinner" style="display:none;"></div>\
        </div>',

    LEAVED_MESSAGE : 'You have just leaved this organization.',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.leaveButton = this.el.querySelector('[data-leave-btn]');
            this.spinnerWrapper = this.el.querySelector('.profile-member-of-msg__spinner');

            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.appendChild(new CV.Loading({
                name : 'spinner',
                size: 20
            })).render(this.spinnerWrapper).setStyle({
                webkitTransformOrigin: '0 0',
                msTransformOrigin: '0 0',
                transformOrigin: '0 0',
            });

            this.appendChild(new CV.PopoverConfirm({
                name : 'leavePopover',
                data : {
                    confirm : {
                        label : 'Leave',
                        className : '-color-negative'
                    }
                }
            }));

            this.appendChild(new CV.PopoverBlocker({
                name : 'popover',
                className : 'unfollow-popover',
                placement : 'top',
                content : this.leavePopover.el
            })).render(this.leaveButton);

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.leaveButton, 'click', this._clickHandlerRef);

            this.leavePopover.bind('confirm', this._leaveHandlerRef.bind(this));
            this.leavePopover.bind('cancel', this._cancelHandlerRef.bind(this));
            return this;
        },

        _clickHandler : function _clickHandler(ev) {
            ev.preventDefault();
            this.popover.activate();
        },

        /* Sets the button state as not following plus call the follow API
         * @method _leaveHandlerRef <private> [Function]
         */
        _leaveHandlerRef : function _leaveHandlerRef() {
            this.popover.deactivate();

            this.leaveButton.style.display = 'none';
            this.spinnerWrapper.style.display = '';

            API.leaveOrganization({
                profileName : Person.get().profileName,
                data : {
                    entityId : Person.get().id,
                    orgId : this.entity.id
                }
            }, function(err, res) {
                console.log(err);
                console.log(res);

                if (err) {
                    this.leaveButton.style.display = '';
                    this.spinnerWrapper.style.display = 'none';
                    return;
                }

                if (res.status === 'left') {
                    this.el.innerHTML = this.constructor.LEAVED_MESSAGE;
                    setTimeout(function() {
                        window.location.reload();
                    }, 1000);
                }
            }.bind(this));
        },

        _cancelHandlerRef : function _cancelHandlerRef() {
            this.popover.deactivate();
        },

        destroy : function destroy() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.leaveButton, 'click', this._clickHandlerRef);

            Widget.prototype.destroy.call(this);
            return null;
        }
    }
});
