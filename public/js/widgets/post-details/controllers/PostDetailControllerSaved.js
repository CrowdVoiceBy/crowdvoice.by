Class(CV, 'PostDetailControllerSaved').includes(NodeSupport, CustomEventSupport)({
    prototype : {
        _index : 0,
        _posts : null,
        _postsLen : 0,

        init : function init(config) {
            this._posts = config.posts;
            this._postsLen = this._posts.length;

            this.appendChild(new CV.PostDetail({
                name: 'widget',
                data: config.data
            })).render(document.body);

            this._posts.some(function(post, index) {
                if (config.data.id === post.id) {
                    this._index = index;
                    return true;
                }
            }, this);

            this._postsLen = this._posts.length;

            this.update();
            this.widget.updatedPosts(this._posts);

            this.widget.render(document.body);
            requestAnimationFrame(function() {
                this.widget.activate();
            }.bind(this));

            this._bindEvents();
        },

        /* Subscribe to the default PostDetailController events.
         * This method might be overriden by any subclass, but also called using super.
         * @protected|abstract
         * @listens {post:details:next}
         * @listens {post:details:prev}
         */
        _bindEvents : function _bindEvents() {
            this.nextHandlerRef = this.nextHandler.bind(this);
            this.prevHandlerRef = this.prevHandler.bind(this);

            this.bind('nextPostDetail', this.nextHandlerRef);
            this.bind('prevPostDetail', this.prevHandlerRef);
        },

        /* Updates the postDetailWidget using the data stored on `_posts`.
         * @private
         */
        update : function update() {
            this.widget.update(this._posts[this._index]);
        },

        /* Updates the post index reference.
         * @public
         * @param {Object} post - a post instance
         * @return {Object} this
         */
        setIndexes : function setIndexes(post) {
            this._index = this._posts.indexOf(post);
            return this;
        },

        /* Prev button click handler.
         * @method prevHandler <protected> [Function]
         */
        prevHandler : function prevHandler(ev) {
            ev.stopPropagation();
            if (this._index === 0) {
                return;
            }

            this._index--;
            this.update();
        },

        /* Next button click handler.
         * @method nextHandler <protected> [Function]
         */
        nextHandler : function nextHandler(ev) {
            ev.stopPropagation();

            if (this._index === (this._postsLen - 1)) {
                return;
            }

            this._index++;
            this.update();
        },

        destroy : function destroy() {
            this.unbind('nextPostDetail', this.nextHandlerRef);
            this.unbind('prevPostDetail', this.prevHandlerRef);
            this.widget = this.widget.destroy();
            return null;
        }
    }
});

