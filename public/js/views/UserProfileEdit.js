Class(CV.Views, 'UserProfileEdit').includes(NodeSupport, CV.WidgetUtils)({
    prototype : {
        _e : null,
        notificationSettings : null,

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
                name : 'profile',
                title : 'My Profile',
                content : CV.UserProfileEditTab,
                contentData : {backgroundImage: this.backgroundImage}
            });

            this.tabs.addTab({
                name : 'account',
                title : 'Account',
                content : CV.UserProfileEditAccountTab,
                contentData : {email: this._e}
            });

            this.tabs.addTab({
                name : 'notifications',
                title : 'Notifications',
                content : CV.UserProfileEditNotificationsTab,
                contentData : {notificationSettings: this.notificationSettings}
            });

            this.tabs.addTab({
                name : 'organizations',
                title : 'Organizations',
                content : CV.UserProfileEditOrganizationsTab,
            });

            this.tabs.addTabIndicator().start();
        }
    }
});
