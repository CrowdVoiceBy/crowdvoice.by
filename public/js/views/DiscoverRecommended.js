Class(CV.Views, 'DiscoverRecommended').includes(NodeSupport, CV.WidgetUtils)({
  prototype: {
    /* List of Voices, People and Organizations that follows the things
     * that the currentPerson follows.
     * GET `/discover/recommended`
     * @property data <required> [Array]
     */
    data: null,

    init: function init(config) {
      Object.keys(config || {}).forEach(function(propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      this.bodyElement = this.el.querySelector('.profile-body');

      this._setup();
    },

    _setup: function _setup() {
      if (this.data.length === 0) {
        this.el.querySelector('.page-heading').style.display = 'none';

        this.appendChild(new CV.DiscoverRecommendedOnboarding({
          name: 'onboarding'
        })).render(this.bodyElement);

        return;
      }

      this.data.forEach(function(item, index) {
        this.appendChild(new CV.DiscoverRecommendedSection({
          name : 'item_' + index,
          data : item
        })).render(this.bodyElement).setup();
      }, this);
    }
  }
});
