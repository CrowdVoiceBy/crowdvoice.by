Class(CV, 'EmbedJumpToLayerLabel').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS : 'voice-timeline-popover_label -line-through',

  HTML : '\
    <div>\
      <span class="-line-through-label -color-neutral-mid"></span>\
    </div>',

  prototype: {
    init : function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.labelElement = this.el.getElementsByTagName('span')[0];

      this.dom.updateText(this.labelElement, this.label);
    }
  }
});
