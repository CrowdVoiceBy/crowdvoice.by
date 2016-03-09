Class(CV, 'EditNotificationsNotifyMeItem').inherits(Widget)({
    ELEMENT_CLASS : '-clearfix',
    HTML : '\
        <div>\
            <div class="notifications-notify-me__options -float-right -pl2"></div>\
            <span class="notifications-notify-me__label -overflow-hidden"></span>\
        </div>',

    prototype : {
        data : {
            label: null,
            settingsType: null,
            checked: null
        },

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            this._setup();
        },

        _setup : function _setup() {
            var optionsWrapper = this.el.querySelector('.notifications-notify-me__options');
            this.el.querySelector('.notifications-notify-me__label').textContent = this.data.label;

            this.data.options.forEach(function(option) {
                this.appendChild(new CV.UI.Checkbox({
                    name : option.label + 'Checkbox',
                    className : '-mr1',
                    settingsType : option.settingsType,
                    data : {
                        label: option.label,
                        checked: option.checked
                    },
                })).render(optionsWrapper);
            }, this);
        },

        /* Returns the state of the checkboxes as an Array of Objects with the
         * settingsType [webSettings || emailSettings] and the checkbox.checked state.
         * @method getSettingsState <public> [Function}
         * @return [{type: String, checked: Boolean}]
         */
        getSettingsState : function getSettingsState() {
            return this.children.map(function(checkbox) {
                return {
                    type: checkbox.settingsType,
                    checked: checkbox.isChecked()
                };
            });
        }
    }
});
