Class(CV.Views, 'MyVoices').includes(NodeSupport, CV.WidgetUtils)({
  prototype: {
    /* Voices separated by STATUS.
     * @property {Object} voices
     */
    voices: null,
    voicesLength : 0,

    init: function init(config) {
      Object.keys(config || {}).forEach(function(propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      this._setup();
    },

    _setup: function _setup() {
      if (this.voicesLength) {
        return this._setupTabs();
      }

      return this._setupOnboardingMessage();
    },

    _setupOnboardingMessage: function _setupOnboardingMessage() {
      while(this.el.firstChild) {
        this.el.removeChild(this.el.firstChild);
      }

      this.appendChild(new CV.MyVoicesOnboarding({
        name: 'onboarding'
      })).render(this.el);
    },

    _setupTabs: function _setupTabs() {
      this.appendChild(new CV.TabsManager({
        name: 'tabs',
        useHash: true,
        nav: document.querySelector('.profile-menu'),
        content: document.querySelector('.profile-menu-content')
      }));

      Object.keys(this.voices).forEach(function (propertyName) {
        var tab = {};
        tab.name = propertyName;
        tab.content = CV.MyVoicesTab;
        tab.contentData = {
          name: propertyName,
          voices: this.voices[propertyName]
        };
        tab.title = this.format.capitalizeFirstLetter(propertyName);

        if (tab.contentData.voices.length) {
          tab.title += ' (' + tab.contentData.voices.length + ')';
        }

        this.tabs.addTab(tab);
      }, this);

      this.tabs.addTabIndicator().start();
    }
  }
});
