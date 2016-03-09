var Events = require('./../../lib/events');
var Waterfall = require('./../../lib/waterfall');

Class(CV, 'SavedPostsManager').inherits(Widget)({
    HTML : '\
        <div class="saved-posts-wrapper">\
            <div class="voice-posts-wrapper"></div>\
        </div>',

    prototype : {
        data : null,

        _window : null,
        _resizeTimer : null,
        _resizeTime : 250,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.voicePostsWrapper = this.el.querySelector('.voice-posts-wrapper');
            this._window = window;

            this._setup()._bindEvents().addPosts(this.data.posts);
        },

        _setup : function _setup() {
            this.waterfall = new Waterfall({
                containerElement : this.voicePostsWrapper,
                columnWidth : 300,
                gutter : 20
            });

           return this;
        },

        _bindEvents : function _bindEvents() {
            this._resizeHandlerRef = this._resizeHandler.bind(this);
            Events.on(this._window, 'resize', this._resizeHandlerRef);

            this.bind('post:display:detail', function (ev) {
                this.displayGallery(ev);
            }.bind(this));

            return this;
        },

        /* Renders the PostDetail Overlay
         */
        displayGallery : function displayGallery(ev) {
            if (this.postDetailController) {
                this.postDetailController = this.postDetailController.destroy();
            }

            this.postDetailController = new CV.PostDetailControllerSaved({
                data : ev.data,
                posts : this.data.posts
            });

            this.postDetailController.widget.bind('deactivate', function() {
                this.postDetailController = this.postDetailController.destroy();
            }.bind(this));
        },

        addPosts : function addPosts(posts) {
            var frag = document.createDocumentFragment();
            var i = 0;
            var len = posts.length;
            var post;

            for (i = 0; i < len; i++) {
                posts[i].name = 'post_' + i;

                post = CV.Post.create(posts[i]);
                post.loadImage().addActions();

                this.appendChild(post).render(frag);
            }

            this.waterfall.addItems([].slice.call(frag.childNodes, 0));
            this.voicePostsWrapper.appendChild(frag);

            return this;
        },

        layout : function layout() {
            this.waterfall.layout();
            return this;
        },

        /* Handle the window resize event.
         * @method _resizeHandler <private> [Function]
         */
        _resizeHandler : function _resizeHandler() {
            var _this = this;

            if (this._resizeTimer) {
                this._window.clearTimeout(this._resizeTimer);
            }

            this._resizeTimer = this._window.setTimeout(function() {
                _this.layout();
            }, this._resizeTime);
        }
    }
});

