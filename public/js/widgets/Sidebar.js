/* globals App */
var Person = require('./../lib/currentPerson');
var animationEnd = require('./../lib/onanimationend');

Class(CV, 'Sidebar').inherits(Widget).includes(CV.WidgetUtils)({

    IS_EXPANDED_CLASSNAME : '-is-expanded',
    IS_PAUSED_CLASSNAME : '-is-paused',

    prototype : {
        el : null,
        linkElements : null,
        _yield : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element;
            this.linkElements = [].slice.call(this.el.querySelectorAll('.sidebar-link'), 0);
            this._yield = document.body.querySelector('.app-wrapper');
            this.helpSupport = this.el.querySelector('.sidebar-link-help-support');
            this.helpSupport.addEventListener('click', this._helpDeskAppend.bind(this));

            this._checkAndActivateCurrentLink();
        },

        /* Make the sidebar expand/collapse on :hover
         * @method enableInteraction <public> [Function]
         */
        enableInteraction : function enableInteraction() {
            this._bindEvents();
        },

        _checkAndActivateCurrentLink : function _checkAndActivateCurrentLink() {
            var pathname = window.location.pathname;

            this.linkElements.some(function(link) {
                if (link.getAttribute('href') === pathname) {
                    link.classList.add('active');
                    return true;
                }
            });

            return this;
        },

        setup : function setup(){
            this._setupMessageCountListener();
            return;
        },

        /* Start/get the socket reference and subscribe to the `unreadMessagesCount` event.
         * This will keep track of how many unread message Person have and update
         * the sidebar message counter bubble as feedback.
         * @method _setupMessageCountListener <private> [Function]
         * @return undefined
         */
        _getUnreadMessageCountPollingMS : 30000,
        _setupMessageCountListener : function _setupMessageCountListener() {
            if (!Person.get()) {
                return;
            }

            var socket = App.getSocket();
            this.messageLinkContainer = this.el.querySelector('.sidebar-link-messages');
            this.unreadMessagesBadgeElement = this.messageLinkContainer.querySelector('.sidebar-link-badge');
            this.unreadMessagesLastValue = 0;

            setTimeout(function() {
                socket.emit('getUnreadMessagesCount');
            }, 1000);

            window.setInterval(function() {
                socket.emit('getUnreadMessagesCount');
            }, this._getUnreadMessageCountPollingMS);

            socket.on('unreadMessagesCount', this._updateSidebarCount.bind(this));
        },

        /* Updates the unreadMessagesBadgeElement contents.
         * Toggles the read/unread link contents.
         * @method _updateSidebarCount <private> [Function]
         * @argument data <required> [Number] total unread messages
         */
        _updateSidebarCount : function _updateSidebarCount(data) {
            if (this.unreadMessagesLastValue !== data) {
                this.unreadMessagesLastValue = data;

                this.dom.updateText(this.unreadMessagesBadgeElement, data);
                this.dom.addClass(this.unreadMessagesBadgeElement, ['-updated']);

                animationEnd(this.unreadMessagesBadgeElement, function() {
                    this.dom.removeClass(this.unreadMessagesBadgeElement, ['-updated']);
                }.bind(this));

                if (data > 0) {
                    this.dom.addClass(this.messageLinkContainer, ['-has-messages']);
                } else {
                    this.dom.removeClass(this.messageLinkContainer, ['-has-messages']);
                }
            }
        },

        _bindEvents : function _bindEvents() {
            this._mouseEnterHandlerRef = this._mouseEnterHandler.bind(this);
            this.el.addEventListener('mouseenter', this._mouseEnterHandlerRef);

            this._mouseLeaveHandlerRef = this._mouseLeaveHandler.bind(this);
            this.el.addEventListener('mouseleave', this._mouseLeaveHandlerRef);
        },

        _helpDeskAppend : function _helpDeskAppend(){
            if(this.helpDeskOverlay){
                this.helpDeskOverlay.activate();
            }else{
                this.appendChild( new CV.HelpDeskOverlay({     
                    name : 'helpDeskOverlay',
                    className : 'active'
                })).render(document.body);
            }
        },

        _mouseEnterHandler : function _mouseEnterHandler() {
            this._yield.classList.add(this.constructor.IS_PAUSED_CLASSNAME);
            this.el.classList.add(this.constructor.IS_EXPANDED_CLASSNAME);
        },

        _mouseLeaveHandler : function _mouseLeaveHandler() {
            this._yield.classList.remove(this.constructor.IS_PAUSED_CLASSNAME);
            this.el.classList.remove(this.constructor.IS_EXPANDED_CLASSNAME);
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            if (this._mouseEnterHandlerRef) {
                this.el.removeEventListener('mouseenter', this._mouseEnterHandlerRef);
                this._mouseEnterHandlerRef = null;
            }

            if (this._mouseLeaveHandlerRef) {
                this.el.removeEventListener('mouseleave', this._mouseLeaveHandlerRef);
                this._mouseLeaveHandlerRef = null;
            }

            this.helpSupport.removeEventListener('click', this._helpDeskAppend.bind(this));

            this.el = null;
            this.linkElements = null;
            this._yield = null;

            return null;
        }
    }
});
