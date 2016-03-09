var Events = require('./../../lib/events');

Class(CV, 'SavedPostsOnboarding').inherits(Widget)({
    HTML : '\
        <section class="saved-posts-onboarding -pt5 -text-center -rel">\
            <h1>No posts saved yet.</h1>\
            <p class="saved-posts-onboarding__msg">As you browse and discover Voices, you might want to save a particular post within a Voice for later reference. All the posts of any kind that you save will be stored here. So go ahead, discover and save all the posts you find interesting or useful to you.</p>\
            <button class="cv-button primary">Explore and Discover!</button>\
        </section>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.button = this.el.getElementsByTagName('button')[0];
            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.button, 'click', this._clickHandlerRef);
            return this;
        },

        _clickHandler : function _clickHandler() {
            window.location.replace('/discover/browse');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.off(this.button, 'click', this._clickHandlerRef);
            this._clickHandlerRef = null;
            return null;
        }
    }
});
