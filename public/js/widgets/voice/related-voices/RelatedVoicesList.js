var Events = require('./../../../lib/events');

Class(CV, 'RelatedVoicesList').inherits(Widget)({
    ELEMENT_CLASS : 'cv-related-voices-list',
    prototype : {
        /* Config data
         * @property data <require>
         */
        data : {
            /* Initial voices to display. (VoiceEntities)
             * @property voices <require> [Array]
             */
            voices : null
        },

        /* Holds the count of how many voices have been added, usefull to keep
         * non-conflict children names.
         * @property _index <private>
         */
        _index: 0,

        init : function(config){
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._setup();
        },

        /* Renders the passed voices as config.
         * @method _setup <private>
         */
        _setup : function _setup() {
            this.data.voices.forEach(this.addVoice, this);
            return this;
        },

        /* Appends a new voice mini on the list.
         * @method addVoice <protected>
         */
        addVoice : function addVoice(voice) {
            this._index++;
            var widgetName = 'voice_' + this._index;

            this.appendChild(new CV.VoiceCoverMini({
                name : widgetName,
                className : 'cv-related-voices__list-item',
                data : voice
            })).render(this.el).showMeta();

            if (this.data.editMode) {
                this[widgetName].appendChild(new CV.UI.Button({
                    name : 'button',
                    className : 'micro',
                    data : {value: 'Remove'}
                })).render(this[widgetName].actionsElement);

                Events.once(this[widgetName].button.el, 'click', function() {
                    this.dispatch('related:voices:remove:item', {widget: this[widgetName]});
                }.bind(this));
            }

            return this;
        },

        removeVoice : function removeVoice(voice) {
            this.removeChild(voice);
            voice = voice.destroy();
            return this;
        }
    }
});
