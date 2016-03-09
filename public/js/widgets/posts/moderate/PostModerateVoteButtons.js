/* globals App */
var API = require('../../../lib/api');

Class(CV, 'PostModerateVoteButtons').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'post-moderate-vote-buttons -abs -clearfix',

    HTML_ALLOW_BUTTON : '\
        <button class="post-moderate-allow-btn cv-button -m0 -float-left">\
            <svg class="-s16">\
                <use xlink:href="#svg-thumbs-up"></use>\
            </svg>\
            <span>Allow</span>\
        </button>',

    HTML_DENY_BUTTON : '\
        <button class="post-moderate-deny-btn cv-button -m0 -float-left">\
            <svg class="-s16">\
                <use xlink:href="#svg-join"></use>\
            </svg>\
            <span>Deny</span>\
        </button>',

    HTML_VOTE_CAST : '\
        <div class="post-moderate-vote-already-cast-msg cv-button -block -m0 -text-center -font-semi-bold -upper">\
            (Vote Cast)\
        </div>',

    HTML_VOTE_ALREADY_CAST : '\
        <div class="post-moderate-vote-already-cast-msg cv-button -block -m0 -text-center -font-semi-bold -upper">\
            (Vote Already Cast)\
        </div>',

    HTML_ERROR : '<div class="post-moderate-vote-error-msg cv-button -block -m0 -text-center -font-semi-bold -upper -abs"></div>',

    prototype : {
        /* The Post parent [Object, Widget reference] */
        post : null,

        allowButton : null,
        denyButton : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            if (this.post.voted === true) {
                this._setInitialStateVoteAlreadyCast();
                return void 0;
            }
            this._setInitialStateCanVote();
        },

        /* Initial state for when the Post was already voted.
         * Displays the "Already Vote" label, do not display the vote buttons at all.
         * @method _setInitialStateVoteAlreadyCast <private>
         */
        _setInitialStateVoteAlreadyCast : function _setInitialStateVoteAlreadyCast() {
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_VOTE_ALREADY_CAST);
        },

        /* Initial state for when the Post can be voted.
         * Displays the "allow" and "deny" buttons and subscribe its events.
         * @method _setInitialStateCanVote <private>
         */
        _setInitialStateCanVote : function _setInitialStateCanVote() {
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_ALLOW_BUTTON);
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_DENY_BUTTON);

            this.allowButton = this.el.querySelector('.post-moderate-allow-btn');
            this.denyButton = this.el.querySelector('.post-moderate-deny-btn');

            this._allowClickHandlerRef = this._allowClickHandler.bind(this);
            this.allowButton.addEventListener('click', this._allowClickHandlerRef);

            this._denyClickHandlerRef = this._denyClickHandler.bind(this);
            this.denyButton.addEventListener('click', this._denyClickHandlerRef);
        },

        /* Remove the allow, deny buttons and unsubscribe its events.
         * @method _removeButtons <private> [Function]
         * @return PostModerateVoteButtons
         */
        _removeButtons : function _removeButtons() {
            this.allowButton.removeEventListener('click', this._allowClickHandlerRef);
            this._allowClickHandlerRef = null;
            this.denyButton.removeEventListener('click', this._denyClickHandlerRef);
            this._denyClickHandlerRef = null;

            this.el.removeChild(this.allowButton);
            this.el.removeChild(this.denyButton);
            this.allowButton = this.denyButton = null;

            return this;
        },

        /* Remove the allow, deny buttons and display the vote already cast message.
         * @method _updateStateToAlreadyVoted <private> [Function]
         * @return PostModerateVoteButtons
         */
        _updateStateToAlreadyVoted : function _updateStateToAlreadyVoted() {
            this._removeButtons();
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_VOTE_ALREADY_CAST);
            return this;
        },

        /* Remove the allow, deny buttons and display the vote cast message.
         * @method _updateStateToVoted <private> [Function]
         * @return PostModerateVoteButtons
         */
        _updateStateToVoted : function _updateStateToVoted() {
            this._removeButtons();
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_VOTE_CAST);
            return this;
        },

        _updateStateError : function _updateStateError(message) {
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_ERROR);
            this.dom.updateText(
                this.el.querySelector('.post-moderate-vote-error-msg'),
                message
            );

            window.setTimeout(function() {
                this.el.removeChild(this.el.querySelector('.post-moderate-vote-error-msg'));
            }.bind(this), 5000);
            return this;
        },

        /* Upvote (allow) click handler. Calls the API to register a new vote-up for the parent Post.
         * @method _allowClickHandler <private>
         */
        _allowClickHandler : function _allowClickHandler() {
            this.disable();

            var args = {
                profileName : App.Voice.data.owner.profileName,
                voiceSlug : App.Voice.data.slug,
                postId : this.post.id,
                vote : 'up'
            };

            API.postVote(args, this._voteResponseHandler.bind(this));
        },

        /* Downvote (deny) click handler. Calls the API to register a new vote-down for the parent Post.
         * @method _denyClickHandler <private>
         */
        _denyClickHandler : function _denyClickHandler() {
            this.disable();

            var args = {
                profileName : App.Voice.data.owner.profileName,
                voiceSlug : App.Voice.data.slug,
                postId : this.post.id,
                vote : 'down'
            };

            API.postVote(args, this._voteResponseHandler.bind(this));
        },

        /* Vote{up,down} API response handler.
         */
        _voteResponseHandler : function _voteResponseHandler(err, response) {
            console.log(response);

            if (err) {
                if (response.status === 403) {
                    this._updateStateToAlreadyVoted().enable();
                    this.el.querySelector('.post-moderate-vote-already-cast-msg').classList.add('negative');
                    return;
                }

                this._updateStateError(response.status + ' - ' + response.statusText).enable();
                return;
            }

            this._updateStateToVoted();
        },

        _disable : function _disable() {
            Widget.prototype._disable.call(this);

            if (this.allowButton) {
                this.allowButton.classList.add('-muted');
                this.allowButton.setAttribute('disabled', true);
            }

            if (this.denyButton) {
                this.denyButton.classList.add('-muted');
                this.denyButton.setAttribute('disabled', true);
            }
        },

        _enable : function _enable() {
            Widget.prototype._enable.call(this);

            if (this.allowButton) {
                this.allowButton.classList.remove('-muted');
                this.allowButton.removeAttribute('disabled');
            }

            if (this.denyButton) {
                this.denyButton.classList.remove('-muted');
                this.denyButton.removeAttribute('disabled');
            }
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            if (this.allowButton) {
                this.allowButton.removeEventListener('click', this._allowClickHandlerRef);
                this._allowClickHandlerRef = null;
            }

            if (this.denyButton) {
                this.denyButton.removeEventListener('click', this._denyClickHandlerRef);
                this._denyClickHandlerRef = null;
            }

            return null;
        }
    }
});
