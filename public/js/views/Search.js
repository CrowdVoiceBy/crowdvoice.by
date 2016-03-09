Class(CV.Views, 'SearchView').includes(NodeSupport, CV.WidgetUtils)({
    prototype : {
        searchResults : null,

        init : function init(config) {
            Object.keys(config || {}).forEach(function(propertyName) {
                this[propertyName] = config[propertyName];
            }, this);

            this.appendChild(new CV.TabsManager({
                name : 'tabs',
                useHash : true,
                nav : document.querySelector('.profile-menu'),
                content : document.querySelector('.profile-menu-content')
            }));

            Object.keys(this.searchResults).forEach(function(propertyName) {
                var config = {};

                if (!this.searchResults[propertyName].length) {
                    return true;
                }

                if (propertyName === 'voices') {
                    config.name = 'voices';
                    config.title = 'Voices';
                    config.content = CV.SearchVoicesTab;
                }

                if (propertyName === 'people') {
                    config.name = 'users';
                    config.title = 'Users';
                    config.content = CV.SearchUsersTab;
                }

                if (propertyName === 'organizations') {
                    config.name = 'organizations';
                    config.title = 'Organizations';
                    config.content = CV.SearchOrganizationsTab;
                }

                config.contentData = this.searchResults[propertyName];

                this.tabs.addTab(config);
            }, this);

            this.tabs.addTabIndicator().start();
        }
    }
});
