var Options = [
  {label: 'Images', value: 'image'},
  {label: 'Videos', value: 'video'},
  {label: 'Links', value: 'link'},
  {label: 'Articles', value: 'text'}
];

Class(CV, 'VoiceFilterPostsDropdown').inherits(Widget).includes(BubblingSupport)({
  HTML : '\
    <div>\
      <span class="voice-filter-posts__label">View:</span>\
    </div>',

  prototype : {
    _options : null,

    init : function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._options = [];
      this._setup()._bindEvents();
    },

    /* Creates the dropdown and its options.
     * @return {Object} this
     */
    _setup : function _setup() {
      var dropdownClassName = 'dropdown-post-source-types ui-dropdown-styled -sm';

      if (this.dropdownClassName) {
        dropdownClassName += ' ' + this.dropdownClassName;
      }

      this.appendChild(new CV.Dropdown({
        name: 'dropdown',
        label: 'All Posts',
        showArrow: true,
        className: dropdownClassName,
        arrowClassName: '-s10',
        bodyClassName: 'ui-vertical-list hoverable -block'
      })).render(this.el);

      Options.forEach(function(option) {
        var name = 'option_' + option.value;

        this.dropdown.addContent(this.appendChild(new CV.UI.Checkbox({
          name : name,
          id : option.value,
          className : 'ui-vertical-list-item -block -p0',
          data : {
            label: option.label,
            checked: true
          }
        })).el);
        this[name].el.setAttribute('data-label', option.label);

        this._options.push(this[name]);
      }, this);

      return this;
    },

    _bindEvents : function _bindEvents() {
      this._changeHandlerRef = this._changeHandler.bind(this);
      this._options.forEach(function(option) {
        option.bind('changed', this._changeHandlerRef);
      }, this);

      return this;
    },

    /* Returns the checkbox widgets that are checked
     * @public
     */
    getSelection : function getSelection() {
      return this._options.filter(function(option) {
        return (option.isChecked() === true);
      });
    },

    /* Returns the selected sourceTypes as an array of string.
     * If all of them it will return null, so that means all of the are
     * selected and should not apply the filter (skip the checking).
     * @public
     * @return {Array|null} selectedSouceTypes
     */
    getSelectedSourceTypes : function getSelectedSourceTypes() {
      var selectedSouceTypes = this.getSelection().map(function(option) {
        return option.id;
      });

      if (selectedSouceTypes.length === this._options.length) {
        selectedSouceTypes = null;
      }

      return selectedSouceTypes;
    },

    /* Handle the Checkboxes change event.
     * Contraint the selection by forcing to keep at least 1 checkbox selected
      * (by disabling the last option if needed).
     * Updates the dropdown label.
     * Calls the `filter` method for every layer to filter its Posts by the
     *  selectedSouceTypes.
     * @private
     */
    _changeHandler : function _changeHandler(ev) {
      ev.stopPropagation();
      var selection = this.getSelection();
      var sourceTypes = this.getSelectedSourceTypes();

      if (sourceTypes && (sourceTypes.length === 1)) {
        // disable the last remaining selected option.
        selection[0].disable();
      } else {
        selection.forEach(function(checkbox) {
          checkbox.enable();
        });
      }

      if (sourceTypes === null) {
        this.dropdown.setLabel('All Posts');
      } else {
        this.dropdown.setLabel(
          selection.map(function(option) {
            return option.el.dataset.label;
          }).join(', ')
        );
      }

      this.dispatch('selectionUpdated', {sourceTypes: sourceTypes});
    },

    /* Handles the click event on the dropdown items.
     * @private
     */
    _clickHandler : function _clickHandler(ev) {
      ev.stopPropagation();
    }
  }
});
