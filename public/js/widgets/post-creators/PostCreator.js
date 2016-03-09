/* globals App */
var Events = require('./../../lib/events');

Class(CV, 'PostCreator').inherits(Widget).includes(CV.WidgetUtils)({

    /* Creates a new instance of a specific PostCreator using the `type` prop passed.
     * @method create <static, public> [Function]
     * @return PostCreator[type] [Class] (undefined)
     */
    create : function create(config) {
        var type = config.type;

        if (!type) {
            console.warn('PostCreator, you need to pass a `type` prop.');
            return;
        }

        return new window.CV['PostCreator' + type](config);
    },

    prototype : {
        _window : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this._window = window;
        },

        /* Subscribe general events shared by any PostCreator.
         * To run this function you need to called from inside any PostCreator.
         * If the other PostCreator has a _bindEvents method too, call CV.PostCreator.prototype._bindEvents.call(this) instead.
         * @method _bindEvents <private> [Function]
         */
        _bindEvents : function _bindEvents() {
            this._windowKeydownHandlerRef = this._windowKeydownHandler.bind(this);
            Events.on(this._window, 'keydown', this._windowKeydownHandlerRef);

            return this;
        },

        /* Adds the close icon and binds its events
         * @method addCloseButton <public> [Function]
         * @return [PostCreator]
         */
        addCloseButton : function addCloseButton() {
            this.appendChild(new CV.UI.Close({
                name : 'closeButton',
                className : 'ui-close-button__overlays -abs',
                svgClassName : '-s18 -color-white'
            })).render(this.el, this.el.firstElementChild);

            this._closeButtonClickHanderRef = this._closeButtonClickHander.bind(this);
            this.closeButton.bind('click', this._closeButtonClickHanderRef);

            return this;
        },

        _windowKeydownHandler : function _windowKeydownHandler(ev) {
            var charCode = (typeof ev.which === 'number') ? ev.which : ev.keyCode;

            if (charCode === 27) { // ESC
                this.deactivate();
            }
        },

        /* Handles the click event on the close button
         * @method _closeButtonClickHander <private> [Function]
         */
        _closeButtonClickHander : function _closeButtonClickHander() {
            this.deactivate();
        },

        _activate : function _activate() {
            Widget.prototype._activate.call(this);
            App.hideScrollbar();
        },

        _deactivate : function _deactivate() {
            Widget.prototype._deactivate.call(this);
            App.showScrollbar();
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            if (this._windowKeydownHandlerRef) {
              Events.off(this._window, 'keydown', this._windowKeydownHandlerRef);
              this._windowKeydownHandlerRef = null;
            }

            this._window = null;

            return null;
        }
    }
});

