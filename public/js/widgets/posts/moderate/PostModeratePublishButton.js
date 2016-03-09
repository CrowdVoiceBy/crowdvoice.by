/* globals App */
var API = require('../../../lib/api');

Class(CV, 'PostModeratePublishButton').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
    HTML : '\
        <button class="post-moderate-publish-btn cv-button -abs -color-success">\
            <svg class="-s16 -mr1">\
                <use xlink:href="#svg-thumbs-up"></use>\
            </svg>\
            <span>Publish</span>\
        </button>\
    ',

    prototype : {
        postId : '',

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._bindEditEvents();
        },

        _bindEditEvents : function _bindEditEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            this.el.addEventListener('click', this._clickHandlerRef);
        },

        _clickHandler : function _clickHandler() {
            this.disable();

            var postEditedData = this.parent.getEditedData();
            /* the important bit */
            postEditedData.approved  = true;

            API.postUpdate({
                profileName : App.Voice.data.owner.profileName,
                voiceSlug : App.Voice.data.slug,
                postId : this.postId,
                data : postEditedData
            }, this._publishPostResponse.bind(this));
        },

        _publishPostResponse : function _publishPostResponse(err, response) {
            var errorMessage = '';

            if (err) {
                errorMessage = 'Error - ' + response.status;
                return this._setErrorState({message: errorMessage}).enable();
            }

            this._setSuccessState();
        },

        _setErrorState : function _setErrorState(config) {
            this.dom.removeClass(this.el, ['-color-success']);
            this.dom.addClass(this.el, ['-color-danger']);

            if (config && config.message) {
                this.el.innerHTML = config.message;
            }

            return this;
        },

        _setSuccessState : function _setSuccessState() {
            this.dom.removeClass(this.el, ['-color-danger']);
            this.dom.addClass(this.el, ['-color-success']);

            this.el.innerHTML = 'Published!';
            this.dispatch('post:moderate:published');

            setTimeout(function() {
                var layer = this.parent.parent;
                layer.removePost(this.parent);
            }.bind(this), 1000);
        },

        _disable : function _disable() {
            Widget.prototype._disable.call(this);
            this.el.classList.add('-muted');
            this.el.setAttribute('disabled', true);
        },

        _enable : function _enable() {
            Widget.prototype._enable.call(this);
            this.el.classList.remove('-muted');
            this.el.removeAttribute('disabled');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.el.removeEventListener('click', this._clickHandlerRef);
            this._clickHandlerRef = null;

            return null;
        }
    }
});
