Class(CV.Views, 'DiscoverTrending').includes(NodeSupport, CV.WidgetUtils)({
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
                title: 'Popular Voices',
                content : CV.DiscoverTrendingVoicesTab
            });

            this.tabs.addTab({
                name : 'updated-voices',
                title: 'Most Updated Voices',
                content : CV.DiscoverTrendingUpdatedVoicesTab
            });

            this.tabs.addTab({
                name : 'users',
                title: 'Popular Users',
                content : CV.DiscoverTrendingUsersTab
            });

            this.tabs.addTab({
                name : 'organizations',
                title: 'Popular Organizations',
                content : CV.DiscoverTrendingOrganizationsTab
            });

            this.tabs.addTabIndicator().start();
        }
    }
});
