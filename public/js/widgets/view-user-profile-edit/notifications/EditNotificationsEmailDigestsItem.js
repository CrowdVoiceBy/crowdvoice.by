Class(CV, 'EditNotificationsEmailDigestsItem').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'notifications-email-digests-item -clearfix',
    HTML : '\
        <div>\
            <div class="notifications-email-digests__options -float-right"></div>\
        </div>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.optionsWrapper = this.el.querySelector('.notifications-email-digests__options');

            if (this.name) {
                this._unique = this.name + '_' + Math.random().toString().replace(/\./,'');
            } else {
                this._unique = Math.random().toString().replace(/\./,'');
            }

            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.appendChild(new CV.UI.Checkbox({
                name : 'checkbox',
                data : {
                    label: this.data.label,
                    checked : this.data.checked
                }
            })).render(this.el);

            this.data.options.forEach(function(option) {
                this.appendChild(new CV.UI.Radio({
                    name : option.label + 'Radio',
                    className : '-mr1',
                    data : {
                        label: option.label,
                        checked: option.checked,
                        attr : {
                            name: this._unique,
                        }
                    },
                })).render(this.optionsWrapper);
            }, this);

            if (this.checkbox.isChecked() === false) {
                this.dom.addClass(this.el, ['off']);
            }

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._checkboxChangedHandlerRef = this._checkboxChangedHandler.bind(this);
            this.checkbox.bind('changed', this._checkboxChangedHandlerRef);

            return this;
        },

        _checkboxChangedHandler : function _checkboxChangedHandler(ev) {
            if (ev.target.isChecked()) {
                this.dom.removeClass(this.el, ['off']);
            } else {
                this.dom.addClass(this.el, ['off']);
            }
        }
    }
});
