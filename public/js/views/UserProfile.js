var Person = require('./../lib/currentPerson');

Class(CV.Views, 'UserProfile').includes(NodeSupport, CV.WidgetUtils)({
    ANONYMOUS_TEMPLATE : '\
        <div class="ui-has-tooltip">\
            <div class="cv-button-group multiple">\
                <button class="cv-button small disable" disabled>Message</button>\
                <button class="cv-button small disable" disabled>Follow</button>\
            </div>\
            <div class="-inline-block -ml1">\
                <div class="profile-actions-settings-dropdown ui-dropdown ui-dropdown-styled disable -md has-arrow">\
                    <div class="ui-dropdown__head -full-height -clickable">\
                        <div class="ui-dropdown-label">\
                            <svg class="-s16 -color-grey-light">\
                                <use xlink:href="#svg-settings"></use>\
                            </svg>\
                        </div>\
                        <svg class="ui-dropdown-arrow -s8 -color-grey">\
                            <use xlink:href="#svg-arrow-down"></use>\
                        </svg>\
                    </div>\
                </div>\
            </div>\
            <span class="ui-tooltip -top" style="width: 210px;">To message or follow others and to see your messages please turn Anonymous mode off.</span>\
        </div>',

    prototype : {
        /* UserEntityModel.
         * @property entity <required> [Object]
         */
        entity : null,

        init : function init(config) {
            Object.keys(config || {}).forEach(function(propertyName) {
                this[propertyName] = config[propertyName];
            }, this);

            this._setup();

            if (Person.get()) {
                this._actionsElementWrapper = this.el.querySelector('.profile__actions');
                this._addActions();
            }
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
                nav : CV.UserProfileTabNav,
                navData : {label: 'Voices'},
                content : CV.UserProfileVoicesTab,
                contentData : {entity: this.entity}
            });

            this.tabs.addTab({
                name : 'followers',
                nav : CV.UserProfileTabNav,
                navData : {label: 'Followers'},
                content : CV.UserProfileFollowersTab,
                contentData : {entity: this.entity}
            });

            this.tabs.addTab({
                name : 'following',
                nav : CV.UserProfileTabNav,
                navData : {label: 'Following'},
                content : CV.UserProfileFollowingTab,
                contentData : {entity: this.entity}
            });

            this.tabs.start();
            this._scaleProfileImage();

            var t = 1000;
            setTimeout(function() {
                this.tabs.voices.getContent().fetch();
            }.bind(this), t);

            setTimeout(function() {
                this.tabs.followers.getContent().fetch();
            }.bind(this), t);

            setTimeout(function() {
                this.tabs.following.getContent().fetch();
            }.bind(this), t);

            return this;
        },

        /* Sets the Actions based on what kind of User currentPerson is
         * related to this profile.
         * @method _addActions <private> [Function]
         */
        _addActions : function _addActions() {
            if (!Person.get()) {
                return;
            }

            if (Person.is(this.entity.id)) {
                return this._updateAsProfileOwner();
            }

            if (Person.anon()) {
                return this._updateAsAnonymous();
            }

            return this._updateAsVisitor();
        },

        /* Display Actions for ProfileOwner.
         * @method _updateAsProfileOwner <private>
         * @return undefined
         */
        _updateAsProfileOwner : function _updateAsProfileOwner() {
            this.appendChild(new CV.UI.Button({
                name : 'editProfileButton',
                className : 'small',
                data : {
                    href : '/' + this.entity.profileName + '/edit',
                    value : 'Edit My Profile'
                }
            })).render(this._actionsElementWrapper);
        },

        /* Display Actions for Anonymous, just a template without behaviour.
         * @method _updateAsAnonymous <private>
         * @return undefined
         */
        _updateAsAnonymous : function _updateAsAnonymous() {
            this._actionsElementWrapper.insertAdjacentHTML('beforeend', this.constructor.ANONYMOUS_TEMPLATE);
        },

        /* Display Actions for Logged in Visitor.
         * @method _updateAsVisitor <private>
         * @return undefined
         */
        _updateAsVisitor : function _updateAsVisitor() {
            var buttonsGroup = document.createElement('div');
            buttonsGroup.className = 'cv-button-group multiple';

            this.appendChild(new CV.UserProfileActionMessage({
                name : 'messageButton',
                className : 'small',
                data : {value: 'Message'},
                entity :  this.entity
            })).render(buttonsGroup);

            if (Person.get().ownedOrganizations.length === 0) {
                this.appendChild(new CV.UserProfileActionFollow({
                    name : 'followButton',
                    className : 'small',
                    entity :  this.entity
                })).render(buttonsGroup);
            } else {
                this.appendChild(new CV.UserProfileActionFollowMultiple({
                    name : 'followButton',
                    className : 'profile-actions-follow-as-wrapper -inline-block',
                    entity :  this.entity
                })).render(buttonsGroup);
            }
            this._actionsElementWrapper.appendChild(buttonsGroup);

            if (Person.canInviteEntity(this.entity)) {
                this.appendChild(new CV.UserProfileMoreActions({
                    name : 'moreActionsDropdown',
                    className : '-inline-block -ml1',
                    entity :  this.entity
                })).render(this._actionsElementWrapper);
            }
        },

        /*
         * Applies Resize and z-index changes to hide the image when scrolling
         */
        _scaleProfileImage : function _scaleProfileImage(){
            window.addEventListener('scroll', function(){
                var distanceY = window.pageYOffset || document.documentElement.scrollTop;
                var profileImage = document.querySelector('.profile-image');
                var newScale = 1 - (distanceY / 100);

                if (distanceY < 50) {
                    profileImage.style.transform = 'scale('+newScale+')';
                    profileImage.style.zIndex = '1';
                } else {
                    profileImage.style.zIndex = '0';
                }
            });
        }
    }
});
