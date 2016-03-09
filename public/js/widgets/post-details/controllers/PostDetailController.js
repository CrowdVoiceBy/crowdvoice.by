Class(CV, 'PostDetailController').includes(NodeSupport, CustomEventSupport)({
  prototype: {
    /* Holds an array with the pages as strings found on the specified registry.
     * @private {Array<string>} - ['0', '1', ...]
     */
    _pages: null,
    _totalPagesLen: 0,
    _currentPageIndex: null,

    /* Holds an array of Posts found on the registry.
     * @private {Array<Object>} - [{Post}, ...]
     */
    _posts: null,
    _currentPostIndex: null,

    /* @param {Object} config
     * @param {Object} config.socket - the Socket instance
     * @param {Object} config.registry - the registry to use to temporary store and read the data from.
     * @param {Object} config.postData - the Post Instance
     * @param {string} config.requestPostsSocketEventName - the name of
     *  the socket event to emit in order to requests the posts data.
     * @param {string} config.responsePostsSocketEventName - the name of
     *  the socket event to bind to receive the posts data as response.
     */
    init: function init(config) {
      Object.keys(config || {}).forEach(function (propertyName) {
        this[propertyName] = config[propertyName];
      }, this);
      this._setup()._bindEvents();
    },

    /* Add widget’s children and sets initial values.
     * @private
     * @return {Object} this
     */
    _setup: function _setup() {
      this.appendChild(new CV.PostDetail({
        name: 'postDetailWidget',
        data: this.postData
      })).render(document.body);

      this._pages = this.registry.getKeys();
      this._posts = this._pages.map(function() {return [];});
      this._totalPagesLen = this._pages.length;

      this.setIndexes(this.postData);

      var storedData = this.registry.get();
      Object.keys(storedData).forEach(function(propertyName, index) {
        var posts = storedData[propertyName];
        if (posts && posts.length) {
          this.updateValues(index, posts);
        }
      }, this);

      this.update();

      requestAnimationFrame(function() {
        this.postDetailWidget.activate();
      }.bind(this));

      this._requestAll();

      return this;
    },

    /* Updates the current page and post indexes based on the postEntity passed.
     * @public
     * @param {Object} post - a post instance
     * @return {Object} this
     */
    setIndexes: function setIndexes(postEntity) {
      Object.keys(this.registry.get()).some(function (page, pageIndex) {
        return (this.registry.get(page) || []).some(function (post, postIndex) {
          if (post.id === postEntity.id) {
            this._currentPageIndex = pageIndex;
            this._currentPostIndex = postIndex;
            return true;
          }
        }, this);
      }, this);
      return this;
    },

    /* Subscribe to the default PostDetailController events.
     * This method might be overriden by any subclass, but also called using super.
     * @protected|abstract
     * @listens {post:details:next}
     * @listens {post:details:prev}
     */
    _bindEvents: function _bindEvents() {
      this.updateRegistryRef = this.updateRegistry.bind(this);
      this.socket.on(this.requestPostsSocketEventName, this.updateRegistryRef);

      this.nextHandlerRef = this.nextHandler.bind(this);
      this.prevHandlerRef = this.prevHandler.bind(this);

      this.bind('nextPostDetail', this.nextHandlerRef);
      this.bind('prevPostDetail', this.prevHandlerRef);

      return this;
    },

    /* Iterates over every registry key and checks if its value is empty,
     * if so it will ask for its values via socket.
     * @private
     */
    _requestAll: function _requestAll() {
      var storedData = this.registry.get();
      Object.keys(storedData).forEach(function(propertyName) {
        var posts = storedData[propertyName];
        if (!posts) {
          this.socket.emit(this.responsePostsSocketEventName, this.postData.voice.id, propertyName);
        }
      }, this);
    },

    /* Checks if previous and next pages data is already stored on the registry,
     * if the data is found on the registry it will update `_posts`
     * otherwise it will request the page data to the socket.
     * @private
     * @return {Object} PostDetailController
     */
    requestSiblings: function requestSiblings(pageIndex) {
      var prevPageString = this._pages[pageIndex - 1]
        , nextPageString = this._pages[pageIndex + 1]
        , prev, next;

      if (prevPageString) {
        prev = this.registry.get(prevPageString);
        if (!prev) {
          this.socket.emit(this.responsePostsSocketEventName, this.postData.voice.id, prevPageString);
        } else {
          this.updateValues(this._pages.indexOf(prevPageString), prev);
        }
      }

      if (nextPageString) {
        next = this.registry.get(nextPageString);
        if (!next) {
          this.socket.emit(this.responsePostsSocketEventName, this.postData.voice.id, nextPageString);
        } else {
          this.updateValues(this._pages.indexOf(nextPageString), next);
        }
      }

      return this;
    },

    /* Updates the registry.
     * @private
     * @param {Array} posts - the posts’ data
     * @param {string} page - the page key to save the posts.
     */
    updateRegistry: function updateRegistry(posts, page) {
      this.registry.set(page, posts);
      var index = this._pages.indexOf(page);
      if (index >= 0) {
        this.updateValues(index, posts);
      }
    },

    /* Updates `_posts` array specific index value.
     * @protected
     * @param {number} index - the page position on the array.
     * @param {array} posts - the page posts data.
     */
    updateValues: function updateValues(index, posts) {
      if ((index < 0) || (index > this._totalPagesLen)) {
        return;
      }

      this._posts[index] = posts;

      if (this._posts[index].length === 0) {
        this.requestSiblings(index);
      }

      this.postDetailWidget.updatedPosts(this._posts.reduce(function(p, n) {
        return p.concat(n);
      }));
    },

    /* Updates the postDetailWidget using the data stored on `_posts` on the index
     * indicated by `_currentPostIndex` value.
     * @private
     */
    update: function update() {
      var current = this._getCurrentPost();
      if (current) {
        this.postDetailWidget.update(current);
      }
    },

    /* Prev button click handler.
     * @protected
     */
    prevHandler: function prevHandler(ev) {
      ev.stopPropagation();

      if (this._currentPostIndex === 0) {
        if (this._currentPageIndex === 0) {
          // TODO: disable prev button
          // this.postDetailWidget.navigation.prevButton.disable();
          return;
        }

        this._currentPageIndex--;
        this._currentPostIndex = 0;

        var childLength = this._posts[this._currentPageIndex].length;
        if (childLength) {
          this._currentPostIndex = (childLength - 1);
        } else {
          return this.prevHandler();
        }

        return this.requestSiblings(this._currentPageIndex).update();
      }

      this._currentPostIndex--;
      this.update();
    },

    /* Next button click handler.
     * @protected
     */
    nextHandler: function nextHandler(ev) {
      ev.stopPropagation();

      if (this._currentPostIndex === this._posts[this._currentPageIndex].length - 1) {
        if (this._currentPageIndex === (this._totalPagesLen - 1)) {
          // TODO: disable next button
          // this.postDetailWidget.navigation.nextButton.disable();
          return;
        }

        this._currentPageIndex++;
        this._currentPostIndex = 0;

        var childLength = this._posts[this._currentPageIndex].length;
        if (!childLength) {
          return this.nextHandler();
        }

        return this.requestSiblings(this._currentPageIndex).update();
      }

      this._currentPostIndex++;
      this.update();
    },

    /* Returns the current page’s data indicated by `_currentPageIndex` and `_currentPostIndex`.
     * @private
     * @return {Object} PostInstance
     */
    _getCurrentPost: function _getCurrentPost() {
      return this._posts[this._currentPageIndex][this._currentPostIndex];
    },

    destroy: function destroy() {
      this.unbind('nextPostDetail', this.nextHandlerRef);
      this.unbind('prevPostDetail', this.prevHandlerRef);
      this.postDetailWidget = this.postDetailWidget.destroy();
      this.socket.removeListener(this.requestPostsSocketEventName, this.updateRegistryRef);
      return null;
    }
  }
});
