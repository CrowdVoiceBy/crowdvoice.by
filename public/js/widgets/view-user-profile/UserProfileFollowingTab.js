var API = require('./../../lib/api');

Class(CV, 'UserProfileFollowingTab').inherits(Widget)({
    HTML : '\
        <div>\
            <h2 class="profile-subheading -font-bold -m0">Following</h2>\
            <div data-dropdown-wrapper class="-inline-block"></div>\
            <hr>\
            <div data-container>\
                <div data-cards-container class="responsive-width-cards -rel"></div>\
                <div data-voices-container class="responsive-width-voice-covers -rel" style="display: none;"></div>\
            </div>\
        </div>',

    prototype : {
        _fetchingUsers : false,
        _fetchedUsers : false,

        _fetchingVoices : false,
        _fetchedVoices : false,

        /* Holds the ResponsiveWidth instance reference for users.
         * @property _responsiveWidthUsers <private>
         */
        _responsiveWidthUsers : null,

        /* Holds the ResponsiveWidth instance reference for voices.
         * @property _responsiveWidthVoices <private>
         */
        _responsiveWidthVoices : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.containerElement = this.el.querySelector('[data-container]');
            this.cardsContainer = this.el.querySelector('[data-cards-container]');
            this.voicesContainer = this.el.querySelector('[data-voices-container]');

            this.appendChild(new CV.Loading({
                name : 'loader'
            })).render(this.cardsContainer).center().setStyle({top: '100px'});

            this._createDropdown();
        },

        _createDropdown : function _createDropdown() {
            this.appendChild(new CV.Dropdown({
                name : 'dropdown',
                showArrow : true,
                className : 'user-profile-following-tab-dropdown ui-dropdown-styled -sm',
                arrowClassName : '-s10 -color-grey',
                bodyClassName : 'ui-vertical-list hoverable -block'
            })).render(this.el.querySelector('[data-dropdown-wrapper]'));
            this.dropdown.setLabel('Users');

            this.appendChild(new Widget({
                name : 'dropdownUsers',
                className : 'ui-vertical-list-item -block'
            })).element.text('Users');

            this.appendChild(new Widget({
                name : 'dropdownVoices',
                className : 'ui-vertical-list-item -block'
            })).element.text('Voices');

            this.dropdown.addContent(this.dropdownUsers.element[0]);
            this.dropdown.addContent(this.dropdownVoices.element[0]);

            this.dropdownUsers.element[0].addEventListener('click', this._showUsers.bind(this));
            this.dropdownVoices.element[0].addEventListener('click', this._showVoices.bind(this));
        },

        fetch : function fetch() {
            this._fetchUsers();
            this._fetchVoices();
        },

        _fetchUsers : function _fetchUsers() {
            if ((this._fetchingUsers === true) || (this._fetchedUsers === true)) {
                return;
            }

            this._fetchingUsers = true;

            API.getEntityFollowedEntities({
                profileName : this.data.entity.profileName,
            }, this._handleFetchUsersResults.bind(this));
        },

        _fetchVoices : function _fetchVoices() {
            if ((this._fetchingVoices === true) || (this._fetchedVoices === true)) {
                return;
            }

            this._fetchingVoices = true;

            API.getEntityFollowedVoices({
                profileName : this.data.entity.profileName,
            }, this._handleFetchVoicesResults.bind(this));
        },

        _handleFetchUsersResults : function _handleFetchUsersResults(err, res) {
            this._fetchingUsers = false;

            if (err) {
                console.log(err);
                return;
            }

            this._fetchedUsers = true;
            this._renderUserResults(res);
        },

        _handleFetchVoicesResults : function _handleFetchVoicesResults(err, res) {
            this._fetchingVoices = false;

            if (err) {
                console.log(err);
                return;
            }

            this._fetchedVoices = true;
            this._renderVoicesResults(res);
        },

         _renderUserResults : function _renderUserResults(entities) {
             var fragment = document.createDocumentFragment();
             this.parent.parent.nav.increaseCounter(entities.length);

             if (entities.length) {
                this._entities = [];
                entities.forEach(function(entity, index) {
                    fragment.appendChild(this.appendChild(new CV.Card({
                        name : 'entity_' + index,
                        data : entity
                    })).el);
                    this._entities.push(this['entity_' + index]);
                }, this);

                this._responsiveWidthUsers = new CV.ResponsiveWidth({
                    container : this.cardsContainer,
                    items : this._entities.map(function(ch) {return ch.el;}),
                    minWidth : 300
                }).setup();

                this.cardsContainer.appendChild(fragment);
             } else {
                this.appendChild(new CV.EmptyState({
                    name : 'empty',
                    className : '-pt4 -pb4',
                    message : '@' + this.data.entity.profileName + ' hasn’t followed any users yet.'
                })).render(this.cardsContainer);
             }

            this.loader.disable().remove();
        },

        _renderVoicesResults : function _renderVoicesResults(voices) {
            var fragment = document.createDocumentFragment();
            this.parent.parent.nav.increaseCounter(voices.length);

            if (voices.length) {
                this._voices = [];
                voices.forEach(function(voice, index) {
                    fragment.appendChild(this.appendChild(new CV.VoiceCover({
                        name : 'voice_' + index,
                        data : voice
                    })).el);
                    this._voices.push(this['voice_' + index]);
                }, this);

                this._responsiveWidthVoices = new CV.ResponsiveWidth({
                    container : this.voicesContainer,
                    items : this._voices.map(function(ch) {return ch.el;}),
                    minWidth : 300
                }).setup();

                this.voicesContainer.appendChild(fragment);
            } else {
                this.appendChild(new CV.EmptyState({
                    name : 'empty',
                    className : '-pt4 -pb4',
                    message : '@' + this.data.entity.profileName + ' hasn’t followed any voices yet.'
                })).render(this.voicesContainer);
            }

            this.loader.disable().remove();
        },

        _showUsers : function _showUsers() {
            this.dropdown.setLabel('Users');
            this.dropdown.deactivate();
            this.cardsContainer.style.display = '';
            this.voicesContainer.style.display = 'none';
            this._responsiveWidthUsers && this._responsiveWidthUsers.update();
        },

        _showVoices : function _showVoices() {
            this.dropdown.setLabel('Voices');
            this.dropdown.deactivate();
            this.voicesContainer.style.display = '';
            this.cardsContainer.style.display = 'none';
            this._responsiveWidthVoices && this._responsiveWidthVoices.update();
        },

        _activate : function _activate() {
            Widget.prototype._activate.call(this);

            if ((this._fetchingUsers === false) && (this._fetchedUsers === false)) {
                this._fetchUsers();
            } else {
                this._responsiveWidthUsers && this._responsiveWidthUsers.update();
            }

            if ((this._fetchingVoices === false) && (this._fetchedVoices === false)) {
                this._fetchVoices();
            } else {
                this._responsiveWidthVoices && this._responsiveWidthVoices.update();
            }
        }
    }
});
