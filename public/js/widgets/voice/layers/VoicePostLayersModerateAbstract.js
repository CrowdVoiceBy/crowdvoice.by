/* Subclass of VoicePostLayers
 * Declares the required abstract methods to handle the Voice Posts on Moderation Mode
 */
Class(CV, 'VoicePostLayersModerateAbstract').inherits(CV.VoicePostLayers)({
  prototype: {
    /* @abstract
     * @property {string} id The voice id */
    id: null,

    /* @abstract
     * @property {Array[string]} _requestedPages Holds the page numbers
     * that have been already requested, this to avoid duplicated calls
     * so the server is not loaded with unnecesary work.
     */
    _requestedPages: null,

    setup: function setup() {
      CV.VoicePostLayers.prototype.setup.call(this);
      this.registry.setup(this.pages);
      this._requestedPages = [];
      this.requestAll();
      return this;
    },

    getPostsRegistry: function getPostsRegistry(date) {
      return this.registry.get(date);
    },

    setPostsRegistry: function setPostsRegistry(date, posts) {
      this.registry.set(date, posts);
    },

    /* Implementation to request post data to the server.
     * @protected, abstract
     * @param {string} id - the voice id
     * @param {string} dateString - `YYYY-MM` formatted string of the Posts we are interested in.
     */
    request: function request(id, dateString, scrollDirection) {
      if (this._requestedPages.indexOf(dateString) >= 0) return;
      this._requestedPages.push(dateString);
      this._socket.emit('getUnApprovedPostsPage', id, dateString, scrollDirection);
    },

    /* Iterates over every registry keys and checks if its value is empty,
     * if so it will ask for its values via socket.
     * @protected, abstract
     */
    requestAll: function requestAll() {
      var storedData = this.getPostsRegistry();
      Object.keys(storedData).forEach(function(propertyName) {
        var posts = storedData[propertyName];
        if (!posts) this.request(this.id, propertyName);
      }, this);
    },

    /* Implementation to add and render posts to a layer.
     * @public, abstract
     */
    addPosts: function addPosts(layer, postsData) {
      var layers = this;

      layer.addEditablePosts(postsData).getPosts().forEach(function(post) {
        // Voice Owner / Org Member / Contributor
        if (layers.allowPostEditing) {
          post.edit().addImageControls().addRemoveButton().addButtonRow();
          post.bind('dimensionsChanged', layers._reLayoutLayer);
          return;
        }

        // Visitor (posts list)
        post.unmoderatedStyle().addVoteButtons();
      });

      layer.reLayout();

      return this;
    },

    /* Implementation to remove/destroy posts from a layer.
     * @public, abstract
     */
    removePosts: function removePosts(layer) {
      var layers = this;

      if (layers.allowPostEditing) {
        layer.getPosts().forEach(function(post) {
          post.unbind('dimensionsChanged', layers._reLayoutLayer);
          post.unedit();
        });
      }

      layer.empty();
      return this;
    },

    /* Gets the scroll height of the scrollable area.
     * @protected
     */
    getScrollHeight: function getScrollHeight() {
      return this.scrollableArea.scrollHeight;
    },

    /* Gets the scroll top of the scrollable area.
     * @protected
     */
    getScrollTop: function getScrollTop() {
      return this.scrollableArea.scrollTop;
    },

    /* Scroll to a y position of the scrollable area.
     * @protected
     */
    scrollTo: function scrollTo(y) {
      this.scrollableArea.scrollTop = y;
    },

    /* dimensionsChanged custom event handler. Updates the posts position when
     * its dimentions has been changed. e.i. on edit mode » change the
     * description/title length
     * @private
     */
    _reLayoutLayer: function _reLayoutLayer(ev) {
      ev.stopPropagation();
      ev.layer.reLayout();
    },

    /* Implementation for custom bindings required by this subclass.
     * @protected, abstract
     */
    __bindEvents: function __bindEvents() {
      this._socket.on('unapprovedPostsPage', this._loadLayerRef);
      this.bind('articleEdited', this._reloadLayer.bind(this));
      return this;
    },

    _reloadLayer: function _reLayoutLayer(){
      this.registry._ = {};
      this.dispatch('reload');
    },

    /* Implementation to remove custom bindings required by this subclass.
     * @protected, abstract
     */
    __destroy: function __destroy() {
      this._socket.removeListener('unapprovedPostsPage', this._loadLayerRef);
    }
  }
});
