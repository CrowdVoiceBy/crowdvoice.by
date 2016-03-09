var Person = require('./../../lib/currentPerson');

Class(CV, 'FeedFollowed').inherits(CV.FeedItem)({
    ELEMENT_CLASS : 'cv-feed-item followed',

    prototype : {
        /* FeedPresenter Result.
         * @property <required> [Object]
         */
        data : null,
        init : function init(config) {
            CV.FeedItem.prototype.init.call(this, config);

            this.updateAvatar();

            if (this.data.itemType === 'entity' && Person.is(this.data.entity.id)) {
                this.setText(this.constructor.stringLink({
                    href: this.getProfileUrl(),
                    text: this.getName()
                }) + ' followed you.');
            } else {
                this.setText(this.constructor.stringLink({
                    href: this.getProfileUrl(),
                    text: this.getName()
                }) + ' followed:');

                if (this.data.itemType === 'entity') {
                    this.appendChild(new CV.CardMini({
                        name: 'card',
                        data: this.data.entity
                    })).render(this.extraInfoElement);
                } else if (this.data.itemType === 'voice') {
                    this.appendChild(new CV.VoiceCoverMini({
                        name: 'voice-cover',
                        data: this.data.voice
                    })).render(this.extraInfoElement);
                }
            }
        }
    }
});
