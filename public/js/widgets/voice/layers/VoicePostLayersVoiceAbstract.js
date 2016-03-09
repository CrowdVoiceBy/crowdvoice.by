/* globals App */
/* Subclass of VoicePostLayers
 * Defines the abstract methods to handle the Voice Posts on Normal Mode
 */
var Person = require('./../../../lib/currentPerson');

Class(CV, 'VoicePostLayersVoiceAbstract').inherits(CV.VoicePostLayers)({
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
      this._socket.emit('getApprovedPostsPage', id, dateString, scrollDirection);
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
      if (Person.ownerOf('voice', App.Voice.data.id)) {
        layer.addEditablePosts(postsData).getPosts().forEach(function(post) {
          post.addActions().addRemoveButton();
        });
      } else {
        layer.addPosts(postsData);
      }

      if (!App.Voice.voiceFooter || !App.Voice.voiceFooter.filterDropdown) return;
      layer.filterPosts(App.Voice.voiceFooter.filterDropdown.getSelectedSourceTypes());
    },

    /* Implementation to remove/destroy posts from a layer.
     * @public, abstract
     */
    removePosts: function removePosts(layer) {
      layer.empty();
      return this;
    },

    /* Gets the scroll height of the scrollable area.
     * @protected
     */
    getScrollHeight: function getScrollHeight() {
      return document.body.clientHeight;
    },

    /* Gets the scroll top of the scrollable area.
     * @protected
     */
    getScrollTop: function getScrollTop() {
      return this.scrollableArea.pageYOffset;
    },

    /* Scroll to a y position of the scrollable area.
     * @protected
     */
    scrollTo: function scrollTo(y) {
      this.scrollableArea.scrollTo(0, y);
    },

    /* Implementation for custom bindings required by this subclass.
     * @protected, abstract
     */
    __bindEvents: function __bindEvents() {
      this._socket.on('approvedPostsPage', this._loadLayerRef);
      return this;
    },

    /* Implementation to remove custom bindings required by this subclass.
     * @protected, abstract
     */
    __destroy: function __destroy() {
      this._socket.removeListener('approvedPostsPage', this._loadLayerRef);
    }
  }
});
