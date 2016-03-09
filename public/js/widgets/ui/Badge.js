Class(CV.UI, 'Badge').inherits(Widget)({
  HTML: '<span class="ui-badge"></span>',
  prototype: {
    setValue: function setValue(value) {
      this.element.text(value);
      return this;
    },

    setStyle: function setStyle(styles) {
      var el = this.element[0];
      Object.keys(styles).forEach(function(propertyName) {
        el.style[propertyName] = styles[propertyName];
      });
      return this;
    },

    _activate: function _activate() {
      this.element.removeClass('-hide');
    },

    _deactivate: function _deactivate() {
      this.element.addClass('-hide');
    }
  }
});
