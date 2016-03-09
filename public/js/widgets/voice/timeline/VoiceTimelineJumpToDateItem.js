Class(CV, 'VoiceTimelineJumpToDateItem').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS:'voice-timeline-popover_option ui-vertical-list-item',

    HTML: '\
      <div>\
        <svg class="option-svg -color-primary -abs">\
          <use xlink:href="#svg-checkmark"></use>\
        </svg>\
        <span class="option-label"></span>\
        <span class="cv-caption -font-normal -color-neutral-mid"></span>\
      </div>',

  prototype: {
    label: '',
    date: '',
    totalPosts: 0,

    el: null,
    labelElement: null,
    counterElement: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.labelElement = this.el.querySelector('.option-label');
      this.counterElement = this.el.querySelector('.cv-caption');

      this.dom.updateText(this.labelElement, this.label);
      this.dom.updateText(this.counterElement, '(' + this.totalPosts + ')');
      this._bindEvents();
    },

    _bindEvents: function _bindEvents() {
      this.clickHandlerRef = this.clickHandler.bind(this);
      this.el.addEventListener('click', this.clickHandlerRef);
    },

    clickHandler: function clickHandler() {
      this.parent.updateActivateOption(this.date);
      this.parent.jumpToDatePopover.deactivate();
      CV.VoiceTimelineJumpToDateItem.dispatch('itemClicked', {
        page: this.page,
        dateString: this.date
      });
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      this.el.removeEventListener('click', this.clickHandlerRef);
      this.clickHandlerRef = null;
      return null;
    }
  }
});
