Class(CV, 'FeedBecamePublicContributor').inherits(CV.FeedItem)({
    ELEMENT_CLASS : 'cv-feed-item became-public-contributor',

    prototype : {
        /* FeedPresenter Result.
         * @property <required> [Object]
         */
        data : null,
        init : function init(config) {
            CV.FeedItem.prototype.init.call(this, config);

            this.updateAvatar();
            this.setText(this.constructor.stringLink({
                href: this.getProfileUrl(),
                text: this.getName()
            }) + ' became a public contributor of a voice:');

            this.appendChild(new CV.VoiceCoverMini({
                name : 'voice-cover',
                data: this.data.voice
            })).render(this.extraInfoElement);
        }
    }
});
