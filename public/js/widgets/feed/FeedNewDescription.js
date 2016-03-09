Class(CV, 'FeedNewDescription').inherits(CV.FeedItem)({
    ELEMENT_CLASS : 'cv-feed-item changed-description',

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
            }) + ' changed description to a voice:');

            this.appendChild(new CV.VoiceCoverMini({
                name: 'voice-cover',
                data: this.data.voice
            })).render(this.extraInfoElement);
        }
    }
});
