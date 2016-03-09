/* Creates the layers, handle the data requests and fill them with posts.
 * This is the base Class to handle the Layers, but it is not used directly
 * though, instead we use one of its subclasses which overrides important
 * bits of this interface, such as the path for the request, socket events names,
 * etc. The current Subclasses are:
 * - VoicePostLayersVoiceAbstract : To handle the Voice Posts
 * - VoicePostLayersModerateAbstract : To handle the Voice Posts as on Moderation Mode
 */
var ScrollTo = require('./../../../lib/scrollto');

Class(CV, 'VoicePostLayers').inherits(Widget).includes(BubblingSupport)({
  HTML: '<section class="voice-posts -rel"></section>',
  MIN_LAYERS_POST: 20,

  prototype: {
    /* DEFAULT BASIC OPTIONS */
    description: '',
    averagePostTotal: 50,
    averagePostWidth: 300,
    averagePostHeight: 500,
    scrollableArea: null,

    /* PRIVATE PROPERTIES */
    _window: null,
    /* socket io instance holder */
    _socket: null,
    /* holds the references of the VoicePostsLayer children instances */
    _layers: null,
    _currentMonthString: '',
    _availableWidth: 0,
    _windowInnerHeight: 0,
    _windowInnerWidth: 0,
    _averageLayerHeight: 0,
    _isInitialLoad: true,
    _lazyLoadingImageArray: null,

    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this._window = window;
      this._socket = this._socket || this.parent._socket;
      this._layers = [];
      this._lazyLoadingImageArray = [];
    },

    setup: function setup() {
      this._setGlobarVars();
      this._createEmptyLayers();
      return this._bindEvents().__bindEvents();
    },

    getLayers: function getLayers() {
      return this._layers;
    },

    _bindEvents: function _bindEvents() {
      this._loadLayerRef = this.loadLayer.bind(this);

      this._jumpToHandlerRef = this._jumpToHandler.bind(this);
      CV.VoiceTimelineJumpToDateItem.bind('itemClicked', this._jumpToHandlerRef);

      CV.VoiceAboutBox.bind('activate', function() {
        this._layers[0].waterfall.layout();
        this._layers[0]._updatePostIndicatorsPostion();
      }.bind(this));

      CV.VoiceAboutBox.bind('deactivate', function() {
        this._layers[0].waterfall.layout();
        this._layers[0]._updatePostIndicatorsPostion();

        localStorage['cvby__voice' + this.id + '__about-read'] = true;
      }.bind(this));

      return this;
    },

    /* Implementation of the data request.
     * All Subclassses should include this method.
     * @private|abstract
     */
    request: function request() {
      throw new Error('VoicePostLayers.prototype.request not implemented');
    },

    /* Implementation of all data request.
     * All Subclassses should include this method.
     * @protected|abstract
     */
    requestAll: function requestAll() {
      throw new Error('VoicePostLayers.prototype.requestAll not implemented');
    },

    /* Implementation of add posts.
     * All Subclasses should include this method.
     * @method addPosts <private, abstract> [Function]
     * @argument layer <required> [HTMLElement] reference to the layer to add the posts
     * @argument postData [Object] <required> the post data returned by the server
     */
    addPosts: function addPosts() {
      throw new Error('VoicePostLayers.prototype.addPosts not implemented');
    },

    /* Gets the scroll height of the scrollable area.
     * @method getScrollHeight <protected> [Function]
     */
    getScrollHeight: function getScrollHeight() {
      throw new Error('VoicePostLayers.prototype.getScrollHeight not implemented');
    },

    /* Gets the scroll top of the scrollable area.
     * @method getScrollTop <protected> [Function]
     */
    getScrollTop: function getScrollTop() {
      throw new Error('VoicePostLayers.prototype.getScrollTop not implemented');
    },

    /* Scroll to a y position of the scrollable area.
     * @method getScrollTo <protected> [Function]
     */
    scrollTo: function scrollTo() {
      throw new Error('VoicePostLayers.prototype.scrollTo not implemented');
    },

    /* Implementation of remove posts.
     * All Subclasses should include this method.
     * @method removePosts <private, abstract> [Function]
     * @argument layer <required> [HTMLElement] the layer to remove the post from
     */
    removePosts: function removePosts() {
      throw new Error('VoicePostLayers.prototype.removePosts not implemented');
    },

    /* Implementation to request data event listeners.
     * All Subclasses should include this method.
     * @method __bindEvents <private, abstract> [Function]
     */
    __bindEvents: function __bindEvents() {
      throw new Error('VoicePostLayers.prototype.__bindEvents not implemented');
    },

    /* Implementation of __destroy method per implementation.
     * All implementations should include this method.
     * @method __destroy <private, abstract> [Function]
     */
    __destroy: function __destroy() {
      throw new Error('VoicePostLayers.prototype.__destroy not implemented');
    },

    /* Updates variables that are dependant to window size and update all layers.
     * @method update <public> [Function]
     * @return this;
     */
    update: function update() {
      this._setGlobarVars()._updateLayers();
      return this;
    },

    loadDefaultLayer: function loadDefaultLayer() {
      this._beforeRequest(this._layers[0].page);
      return this;
    },

    /* Jump to layer handler
     * @method _jumpToHandler <private> [Function]
     */
    _jumpToHandler: function _jumpToHandler(data) {
      var layer = this['postsLayer_' + data.page];
      var _this = this;

      if (!layer) return;
      if (layer === this.getCurrentMonthLayer()) return;

      this.parent._listenScrollEvent = false;

      this.getLayers().forEach(function(layer) {
        if (_this._canRemovePosts(layer)) {
          _this.removePosts(layer);
        }
      });

      ScrollTo(this.scrollableArea, {
        y: layer.element.offset().top,
        duration: 600,
        onComplete: function() {
          _this.parent._listenScrollEvent = true;
          _this.scrollTo(_this.getScrollTop() + 2);
        }
      });
    },

    /* Cache variables values that depend on window’s size. This method is called on the init method and on the window.resize event.
     * @method _setGlobarVars <private>
     * @return undefined
     */
    _setGlobarVars: function _setGlobarVars() {
      this._windowInnerHeight = this._window.innerHeight;
      this._windowInnerWidth = this._window.innerWidth;
      this._availableWidth = this.el.clientWidth;
      this._updateAverageLayerHeight();
      return this;
    },

    /* Sets the value to the _averageLayerHeight property.
     * @method _updateAverageLayerHeight <private>
     * @return undefined
     */
    _updateAverageLayerHeight: function _updateAverageLayerHeight() {
      this._averageLayerHeight = ~~(this.averagePostTotal * this.averagePostHeight / ~~(this._availableWidth / this.averagePostWidth));
    },

    /* Creates all the required (empty) layers per month based on the
     * `firstPostDate` and `lastPostDate` properties.
     * @method _createEmptyLayers <private>
     * @return undefined
     */
    _createEmptyLayers: function _createEmptyLayers() {
      var frag = document.createDocumentFragment();

      this.pages.forEach(function (page, index) {
        var layer = new CV.VoicePostsLayer({
          id: index,
          name: 'postsLayer_' + page,
          page: page,
          columnWidth: this.averagePostWidth
        });
        layer.setHeight(this.getAverageLayerHeight());
        this._layers.push(layer);
        this.appendChild(layer);
        frag.appendChild(layer.el);
      }, this);

      this.el.appendChild(frag);
      this._layers[0].el.classList.add('first');
      this._layers[this._layers.length - 1].el.classList.add('last');
    },

    _updateLayers: function _updateLayers() {
      this._layers.forEach(function(layer) {
        layer.reLayout({
          averageHeight: this.getAverageLayerHeight()
        });
      }, this);
    },

    _appendVoiceAboutBox: function _appendVoiceAboutBox(layer) {
      var voiceAboutBox = new CV.VoiceAboutBox({
        name: 'voiceAboutBox',
        description: this.description
      });

      layer.waterfall.addItems([voiceAboutBox.el]);
      layer.appendChild(voiceAboutBox).render(layer.postContainerElement);

      if (!localStorage['cvby__voice' + this.id + '__about-read']) {
        voiceAboutBox.activate();
      }

      voiceAboutBox = null;
    },

    /* Determines if we need to request the posts for the passed date.
     * If so, it will ask the socket to retrive the posts for a specific year-month.
     * @method _beforeRequest <private> [Function]
     */
    _beforeRequest: function _beforeRequest(dateString, scrollDirection) {
      if (dateString === this._currentMonthString) {
        return;
      }

      this._currentMonthString = dateString;

      // prevent to append childs if the layer is already filled
      if (this['postsLayer_' + dateString].getPosts().length) {
        return;
      }

      // load from cache
      var posts = this.getPostsRegistry(dateString);
      if (posts) {
        return this.loadLayer(posts, dateString, scrollDirection);
      }

      // request to the server
      this.request(this.id, dateString, scrollDirection);
    },

    /* Fills a specific layer with childs (posts).
     * Stores the server response.
     * @param postsData <required> [Objects Array] the raw data of Post Models retrived from the server. We us this data to crate Post Widgets.
     * @dateString <required> [String] the data's month-year we received
     * @scrollDirection <optional> [Boolean] {false} false for downwards  1 for upwards
     * @return undefined
     */
    loadLayer: function loadLayer(postsData, dateString, scrollDirection) {
      this.registry.set(dateString, postsData);

      if (dateString !== this._currentMonthString) {
        return;
      }

      if (this['postsLayer_' + dateString].getPosts().length) {
        return;
      }

      var currentLayer = this.getCurrentMonthLayer();
      var prev = currentLayer.getPreviousSibling();
      var next = currentLayer.getNextSibling();
      var calculateScrollDiff = false;
      var oldScrollHeight = 0;
      var oldScrollY = 0;

      if (!this.getPostsRegistry(dateString)) {
        this.setPostsRegistry(dateString, postsData);
      }

      if (scrollDirection && !currentLayer.isFinalHeightKnow()) {
        calculateScrollDiff = true;
        oldScrollHeight = this.getScrollHeight();
        oldScrollY = this.getScrollTop();
      }

      if ((this.name === 'voicePostLayersManager') && (currentLayer.id === 0)) {
        this._appendVoiceAboutBox(currentLayer);
      }

      this.addPosts(currentLayer, postsData);

      if (this._isInitialLoad) {
        this._isInitialLoad = false;
        this.loadImagesVisibleOnViewport();
        this.dispatch('ready', {layer: currentLayer});
      }

      this.dispatch('layerLoaded', {dateString: dateString});

      currentLayer.arrangeReset();

      if (prev) {
        prev.arrangeBringToFront();
      }

      if (scrollDirection) {
        var next2 = next && next.getNextSibling();
        if (next2 && this._canRemovePosts(next2)) {
          this.removePosts(next2);
          next2.arrangeReset();
        }

        if (calculateScrollDiff) {
          /* compensate the heigth difference when scrolling up */
          var newScrollHeight = this.getScrollHeight();
          var newScrollY = this.getScrollTop();
          var scrollHeightDiff = oldScrollHeight - newScrollHeight;
          var scrollYDiff = oldScrollY - newScrollY;
          var diff = newScrollY - (scrollHeightDiff - scrollYDiff);

          this.parent._listenScrollEvent = false;
          this.scrollTo(diff);
          this.parent._listenScrollEvent = true;
        }

        return;
      }

      var prev2 = prev && prev.getPreviousSibling();
      if (prev2 && this._canRemovePosts(prev2)) {
        this.removePosts(prev2);
        prev2.arrangeReset();
      }
    },

    getCurrentMonthLayer: function getCurrentMonthLayer() {
      return this['postsLayer_' + this._currentMonthString];
    },

    /* Returns the value hold by the `_averageLayerHeight` property.
     * @method getAverageLayerHeight <public>
     * @return this._averageLayerHeight
     */
    getAverageLayerHeight: function getAverageLayerHeight() {
      return this._averageLayerHeight;
    },

    isScrolledIntoView: function isScrolledIntoView(el) {
      var r = el.getBoundingClientRect();

      return ((r.top < this._windowInnerHeight) && (r.bottom >= 0));
    },

    loadImagesVisibleOnViewport: function loadImagesVisibleOnViewport() {
      this._lazyLoadingImageArray.forEach(function(image) {
        image.abortImage();
      });

      this._lazyLoadingImageArray = [];

      if (!this.getCurrentMonthLayer().getPosts().length) { return; }

      this.getCurrentMonthLayer().getPosts().forEach(function(post) {
        if (post.imageLoaded === false) {
          if (this.isScrolledIntoView(post.el)) {
            this._lazyLoadingImageArray.push( post.loadImage() );
          }
        }
      }, this);
    },

    /* Returns if a layer has posts to remove and also fulfills the MIN_LAYERS_POST
     * constraint.
     * @return {Boolean}
     */
    _canRemovePosts: function _canRemovePosts(layer) {
      return (layer.getPosts() && (layer.getPosts().length > this.constructor.MIN_LAYERS_POST));
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);
      this.__destroy();
      CV.VoiceTimelineJumpToDateItem.unbind('itemClicked', this._jumpToHandlerRef);
      this._jumpToHandlerRef = null;
      return null;
    }
  }
});
