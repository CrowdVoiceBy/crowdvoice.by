Class(CV.Views, 'DiscoverNew').includes(NodeSupport, CV.WidgetUtils)({
    prototype : {
        init : function init(config) {
            Object.keys(config || {}).forEach(function(propertyName) {
                this[propertyName] = config[propertyName];
            }, this);

            this._setup();
        },

        _setup : function _setup() {
            this.appendChild(new CV.TabsManager({
                name : 'tabs',
                useHash : true,
                nav : document.querySelector('.profile-menu'),
                content : document.querySelector('.profile-menu-content')
            }));

            this.tabs.addTab({
                name : 'voices',
                title: 'Voices',
                content : CV.DiscoverNewVoicesTab
            });

            this.tabs.addTab({
                name : 'people',
                title: 'People',
                content : CV.DiscoverNewPeopleTab
            });

            this.tabs.addTab({
                name : 'organizations',
                title: 'Organizations',
                content : CV.DiscoverNewOrganizationsTab
            });

            this.tabs.addTabIndicator().start();
        }
    }
});
