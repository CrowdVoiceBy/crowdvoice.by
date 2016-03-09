Class(CV, 'PostText').inherits(CV.PostLink)({
  ICON: '<svg class="post-card-meta-icon"><use xlink:href="#svg-article"></use></svg>',

  prototype: {
    init: function(config) {
      CV.PostLink.prototype.init.call(this, config);
    },

    _setup: function() {
      CV.PostLink.prototype._setup.call(this);

      this.dom.updateText(this.descriptionElement, this.format.truncate(this.stripHTML(this.description), 180, true));

      return this;
    },

    _bindEvents: function() {
      CV.PostLink.prototype._bindEvents.call(this);
    },

    stripHTML: function(html) {
      var tmpEl = document.createElement('DIV');
      tmpEl.innerHTML = html;
      return tmpEl.textContent;
    }
  }
});
