Class(CV, 'EmptyState').inherits(Widget).includes(CV.WidgetUtils)({
  HTML: '\
    <div class="cv-empty-state -text-center">\
      <div class="cv-empty-state__svg-wrapper">\
        <svg class="cv-empty-state__svg">\
          <use xlink:href="#svg-logo-flat"></use>\
        </svg>\
      </div>\
      <div class="cv-empty-state__message"></div>\
    </div>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);

      var wrapper = this.element[0].querySelector('.cv-empty-state__message');
      if (this.message) {
        this.dom.updateText(wrapper, this.message);
      }
      if (this.messageHTML) {
        this.dom.updateHTML(wrapper, this.messageHTML);
      }
    }
  }
});
