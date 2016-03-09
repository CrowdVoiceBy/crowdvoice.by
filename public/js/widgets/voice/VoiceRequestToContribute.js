var Events = require('./../../lib/events');

Class(CV, 'VoiceRequestToContribute').inherits(Widget)({
    ELEMENT_CLASS : 'request-to-contribute-container -inline-block',

    prototype : {
        /* Voice Model of the current voice.
         * @property voice <required> [VoiceModel]
         */
        voice : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.appendChild(new CV.UI.Button({
                name : 'button',
                className : 'request-to-contribute-button tiny',
                data : {value: 'Request to Contribute'}
            })).render(this.el);
            return this;
        },

        /* Subscribe its events.
         * @method _bindEvents <private>
         */
        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.button.el, 'click', this._clickHandlerRef);
            return this;
        },

        /* Button click handler.
         * @method _clickHandler <private>
         */
        _clickHandler : function _clickHandler() {
            if (this.popover) {
                this.popover = this.popover.destroy();
                this.requestToContribute = this.requestToContribute.destroy();
            }

            this.appendChild(new CV.PopoverBlocker({
                name : 'popover',
                title : 'Want to help out?',
                placement : 'bottom-right',
                showCloseButton : true,
                className : 'request-to-contribute-popover',
            })).render(this.el);

            this.appendChild(new CV.RequestToContribute({
                name : 'requestToContribute',
                data : {voice: this.voice}
            }));

            this.requestToContribute.bind('close', function() {
                this.popover.deactivate();
            }.bind(this));

            this.popover.setContent(this.requestToContribute.el);

            requestAnimationFrame(function() {
                this.popover.activate();
            }.bind(this));
        },

        disable : function disable() {
            Widget.prototype.disable.call(this);
            this.button.disable();
        }
    }
});
