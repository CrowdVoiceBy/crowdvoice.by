var Events = require('./../../../lib/events');

Class(CV, 'ManageContributorsButton').inherits(CV.UI.Button)({
    BUTTON_TEXT_TEMPLATE : 'Manage Contributors ({count})',

    prototype : {
        data : {
            /* Initial button text.
             * @property value <optional> [String]
             */
            value : null,
            /* Current Voice Model.
             * @property voice <required> [Object]
             */
            voice : null,
            /* Array of VoiceContributors Models.
             * @property contributors <required> [Array]
             */
            contributors : null
        },

        _totalContributors : 0,

        init : function init(config) {
            CV.UI.Button.prototype.init.call(this, config);
            this._totalContributors = this.data.contributors.length;
            this._updateButtonText(this._totalContributors);
            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.el, 'click', this._clickHandlerRef);
            return this;
        },

        /* Updates the button text using the BUTTON_TEXT_TEMPLATE string.
         * It requires a number to be pass as param to display the total of
         * contributors.
         * @method _updateButtonText <private> [Function]
         * @argument count <required> [Number]
         * @return ManageContributorsButton
         */
        _updateButtonText : function _updateButtonText(count) {
            var text = this.constructor.BUTTON_TEXT_TEMPLATE;
            text = text.replace(/{count}/, count || 0);
            this.updateText(text);
            return this;
        },

        /* Handles the button click.
         * Instantiate a new ManageContributors Modal and renders it.
         * @method _clickHandler <private> [Function]
         * @return undefined
         */
        _clickHandler : function _clickHandler() {
            if (this.modal) {
                this.modal = this.modal.destroy();

                this.manageContributors.unbind('collaborator-removed', this._collaboratorRemovedListenerRef);
                this._collaboratorRemovedListenerRef = null;
                this.manageContributors = this.manageContributors.destroy();
            }

            this.appendChild(new CV.UI.Modal({
                name : 'modal',
                title : 'Manage Contributors',
                width : 900
            })).render(document.body);

            this.appendChild(new CV.ManageContributors({
                name : 'manageContributors',
                data : {
                    voice : this.data.voice,
                    contributors : this.data.contributors
                }
            })).render(this.modal.bodyElement).setup();

            this._collaboratorRemovedListenerRef = this._collaboratorRemovedListener.bind(this);
            this.manageContributors.bind('collaborator-removed', this._collaboratorRemovedListenerRef);

            requestAnimationFrame(function() {
                this.modal.activate();
            }.bind(this));
        },

        /* Listens when manageContributors reports a collaborator has been removed
         * so it can update the button counter.
         * @method _collaboratorRemovedListener <private> [Function]
         * @return undefined
         */
        _collaboratorRemovedListener : function _collaboratorRemovedListener(ev) {
            ev.stopPropagation();
            this._totalContributors--;
            this._updateButtonText(this._totalContributors);
        },

        destroy : function destroy() {
            Events.off(this.el, 'click', this._clickHandlerRef);
            this._clickHandlerRef = null;
            CV.UI.Button.prototype.destroy.call(this);
            return null;
        }
    }
});
