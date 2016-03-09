Class(CV, 'DiscoverRecommendedSection').inherits(Widget).includes(CV.WidgetUtils)({
    prototype: {
      init: function init(config) {
        Widget.prototype.init.call(this, config);
        this.el = this.element[0];
        this._setup();
      },

      _setup: function _setup() {
        if (this.data.voices.length) {
          this.appendChild(new CV.DiscoverRecommendedSectionItem({
            name: 'section_' + this.name + '_voices',
            data: this.data
          })).render(this.el).addVoices(this.data.voices);
        }

        if (this.data.people.length) {
          this.appendChild(new CV.DiscoverRecommendedSectionItem({
            name: 'section_' + this.name + '_people',
            data: this.data
          })).render(this.el).addCards(this.data.people);
        }

        if (this.data.organizations.length) {
          this.appendChild(new CV.DiscoverRecommendedSectionItem({
            name: 'section_' + this.name + '_organizations',
            data: this.data
          })).render(this.el).addCards(this.data.organizations);
        }
      },

      setup: function setup() {
        this.children.forEach(function(child) {
          child.update();
        });
        return this;
      }
    }
});
