var Topics = require('./../../lib/registers/Topics');

Class(CV.UI, 'DropdownTopics').inherits(Widget)({
    HTML : '\
        <div class="ui-form-field">\
            <label class="-block">\
                <span class="ui-input__label -upper -font-bold">Voice Topics</span>\
            </label>\
        </div>\
    ',

    DEFAULT_LABEL : '- Select at least one',

    prototype : {
        _options : null,
        _items : null,
        _fetched : false,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._options = [];
            this._items = [];

            this._setup();
        },

        _setup : function _setup() {
            this.appendChild(new CV.Dropdown({
                name : 'dropdown',
                label : this.constructor.DEFAULT_LABEL,
                showArrow : true,
                className : 'dropdown-topics ui-dropdown-styled -lg',
                arrowClassName : '-s10 -color-grey',
                bodyClassName : 'ui-vertical-list hoverable -full-width'
            })).render(this.el).disable();

            Topics.get(function(err, topics) {
                if (err) {
                    return;
                }

                topics.forEach(function(topic) {
                    this.dropdown.addContent(this.appendChild(new CV.UI.Checkbox({
                        name : topic.slug,
                        id : topic.id,
                        className : 'ui-vertical-list-item -block -p0',
                        data : {label : topic.name}
                    })).el);

                    this._options.push(this[topic.slug]);
                }, this);

                this._items = [].slice.call(this.dropdown.getContent());
                this._bindEvents();
                this.dropdown.enable();
                this._fetched = true;
                this.dispatch('fetched');
            }.bind(this));

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._changeHandlerRef = this._changeHandler.bind(this);
            this._options.forEach(function(option) {
                option.bind('changed', this._changeHandlerRef);
            }, this);
            return this;
        },

        /* Checks the options matching the passed values array.
         * It basically recieves an array of ids and compare them with the existing
         * options, if they match then the option gets selected.
         * @method selectValues <public> [Function]
         * @argument topicIds <required> [Array]
         * @return DropdownTopics
         */
        selectValues : function selectValues(topicIds) {
            if (!this._fetched) {
                return this.bind('fetched', this.selectValues.bind(this, topicIds));
            }

            this._options.forEach(function(topic) {
                if (topicIds.indexOf(topic.id) !== -1) {
                    topic.check();
                }
            });

            return this;
        },

        /* Returns the checkbox widgets that are checked.
         * @method getValue <public>
         * @return this.children.isChecked() [Array]
         */
        getSelection : function getSelection() {
            return this._options.filter(function(option) {
                return (option.isChecked() === true);
            });
        },

        /* Sets the error state on the dropdown.
         * @method error <public>
         * @return DropdownTopics
         */
        error : function error() {
            this.dropdown.error();
            return this;
        },

        _changeHandler : function _changeHandler() {
            this._updateLabel();
        },

        /* Updates the label to show the current selected options separated by comma
         * if any, otherwise it will display the default label.
         * @method _updateLabel <private> [Function]
         */
        _updateLabel : function _updateLabel() {
            var label = this._options.filter(function(option) {
                return option.isChecked();
            }).map(function(option) {
                return option.data.label;
            }).join(', ');

            if (label) {
                this.dropdown.setLabel(label);
            } else {
                this.dropdown.setLabel(this.constructor.DEFAULT_LABEL);
            }
        },

        destroy : function destroy() {
            this._options.forEach(function(option) {
                option.unbind('changed', this._changeHandlerRef);
            }, this);
            this._changeHandlerRef = null;

            Widget.prototype.destroy.call(this);
            return null;
        }
    }
});
