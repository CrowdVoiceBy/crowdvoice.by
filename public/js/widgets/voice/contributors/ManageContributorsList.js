Class(CV, 'ManageContributorsList').inherits(Widget).includes(BubblingSupport)({
    ELEMENT_CLASS : 'cv-manage-contributors-list',
    prototype : {
        data : {
            contributors : null
        },
        _index: 0,

        init : function(config){
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._setup();
        },

        _setup : function _setup() {
            this.data.contributors.forEach(this.addUser, this);
            return this;
        },

        addUser : function addUser(user) {
            this._index++;
            this.appendChild(new CV.CardMini({
                name : 'user_' + this._index,
                className : 'cv-manage-contributors__list-item',
                data : user
            })).render(this.el).addButtonAction({
                name : 'removeButton',
                value : 'Remove',
                className : 'micro',
                eventName : 'card-remove-action-clicked'
            });
        },

        removeUser : function removeUser(user) {
            this.removeChild(user);
            user = user.destroy();
            return this;
        }
    }
});

