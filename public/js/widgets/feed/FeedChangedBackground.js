Class(CV, 'FeedChangedBackground').inherits(CV.FeedItem)({
    ELEMENT_CLASS : 'cv-feed-item changed-background',

    prototype : {
        /* FeedPresenter Result.
         * @property <required> [Object]
         */
        data : null,
        init : function init(config) {
            CV.FeedItem.prototype.init.call(this, config);

            if (this.data.entity.type === 'organization') {
                this._updateForOrganization();
            } else {
                this._updateForUser();
            }
        },

        _updateForOrganization : function _updateForOrganization() {
            this.updateAvatar(this.data.entity.images.notification.url);
            this.setText(this.constructor.stringLink({
                href: '/' + this.data.entity.profileName + '/',
                text: this.data.entity.name
            }) + ' changed background.');
        },

        _updateForUser : function _updateForUser() {
            this.updateAvatar();
            this.setText(this.constructor.stringLink({
                href: this.getProfileUrl(),
                text: this.getName()
            }) + ' changed background.');
        }
    }
});
