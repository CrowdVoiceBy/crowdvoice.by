Class(CV.Views, 'OrganizationProfileEdit').includes(NodeSupport, CV.WidgetUtils)({
  prototype: {
    entity: null,

    init: function init(config) {
      Object.keys(config || {}).forEach(function(propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      this._setup();
    },

    _setup: function _setup() {
      this.appendChild(new CV.TabsManager({
        name: 'tabs',
        useHash: true,
        nav: document.querySelector('.profile-menu'),
        content: document.querySelector('.profile-menu-content')
      }));

      this.tabs.addTab({
        name: 'profile',
        title: 'Profile',
        content: CV.OrganizationProfileEditTab,
        contentData: {entity: this.entity}
      });

      this.tabs.addTab({
        name: 'notifications',
        title: 'Notifications',
        content: CV.OrganizationProfileEditNotificationsTab,
        contentData: {
          notificationSettings: this.notificationSettings,
          entity: this.entity
        }
      });

      this.tabs.addTab({
        name: 'members',
        title: 'Members',
        content: CV.OrganizationProfileEditMembersTab,
        contentData: {entity: this.entity}
      });

      this.tabs.addTabIndicator().start();
    }
  }
});
