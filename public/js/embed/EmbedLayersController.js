var moment = require('moment');
var Events = require('./../lib/events');
var ScrollTo = require('./../lib/scrollto');

Class(CV, 'EmbedLayersController').includes(NodeSupport, CustomEventSupport, BubblingSupport)({
  SWITCH_HEADER_MIN_WIDTH: 360,
  MIN_LAYERS_POST: 20,
  HEADER_HEIGHT: 52,

  prototype: {
    averagePostTotal: 50,
    averagePostWidth: 300,
    averagePostHeight: 500,

    _resizeTimer: null,
    _resizeTime: 500,
    _scrollTimer: null,
    _scrollTime: 250,

    /**
     * @param {Object} config - the configuration object
     * @property {HTMLElement} el - the element to append each one of the  layers.
     * @property {Object} config.voiceData - the active voice data passed  through the VoicesPresenter.
     * @property {string} config.viewType - the current post view type (selected on the embeddable widget configuration and updated by the buttons group view on the header.
     * @property {Object} config.registry - the registry to use to set/get the Posts data.
     * @property {string} config.firstPostDate - the voice’s first published post date.
     * @property {string} config.lastPostDate - the voice’s last published post date.
     * @property {Object} socket - the socket instance to use to fetch the data.
     */
    init: function init (config) {
      Object.keys(config).forEach(function (propertyName) {
        this[propertyName] =  config[propertyName];
      }, this);

      this._body = document.body;
      this._window = window;
      this._lastScrollTop = 0;
      this._listenScrollEvent = true;
      this._averageLayerHeight = 0;
      this._lazyLoadingImageArray = [];

      this.headerElement = document.querySelector('header');
      this.headerMetaElement = document.querySelector('.header-meta');
      this.switchHeaderTitleHeight = (
        this.headerElement.offsetHeight +
        document.querySelector('.voice-title').offsetHeight
      );
      this.mainContent = document.getElementsByClassName('main')[0];
      this._firstDateMS = moment(this.firstPostDate).format('x') * 1000;
      this._lastDateMS = moment(this.lastPostDate).format('x') * 1000;
      this._lastScrollDate = this._lastDateMS;

      this.registry.setup(this.postsCount);

      this.updateGlobalVars();
      this._bindEvents()._createEmptyLayers(this.postsCount)._requestAll();
    },

    setup: function setup () {
      this._beforeRequest(this.getLayers()[0].page);

      this.timeline = new CV.Timeline()
        .render(this.headerElement)
        .updateBgColor('#' + this.parent.reqQuery.accent)
        .run(document.documentElement.clientWidth - 14);

      this.jumpToLayer = new CV.EmbedJumpToLayer({
        triggerElement: this.timeline.el,
        postsCount: Embed.pagesForMonths.approved
      });

      this._activateJumpToPopoverRef = this._activateJumpToPopover.bind(this);
      this.jumpToLayer.bind('activate', this._activateJumpToPopoverRef);

      this._deactivateJumpToPopoverRef = this._deactivateJumpToPopover.bind(this);
      this.jumpToLayer.bind('deactivate', this._deactivateJumpToPopoverRef);

      this._jumpToLayerRef = this._jumpToLayer.bind(this);
      this.jumpToLayer.bind('jumpToLayer', this._jumpToLayerRef);

      return this;
    },

    /* Jump to layer handler
     * @private
     */
    _jumpToLayer: function _jumpToLayer(ev) {
      var _this = this;
      var layer = this['layer_' + ev.page];

      if (!layer) { return; }
      if (layer === this.getCurrentMonthLayer()) { return; }

      this._listenScrollEvent = false;

      this.getLayers().forEach(function(layer) {
        if (this._canRemovePosts(layer)) {
          this.removePosts(layer);
        }
      }, this);

      ScrollTo(this._window, {
        y: (layer.element.offset().top - this.constructor.HEADER_HEIGHT),
        duration: 600,
        onComplete: function onComplete() {
          _this._listenScrollEvent = true;
          _this._window.scrollTo(0, _this._window.scrollY + 2);
        }
      });
    },

    /* Subscribe the widget’s events and the widget’s children events if needed.
     * @private
     */
    _bindEvents: function _bindEvents() {
      this._scrollHandlerRef = this._scrollHandler.bind(this);
      Events.on(this._window, 'scroll', this._scrollHandlerRef);

      this._resizeHandlerRef = this._resizeHandler.bind(this);
      Events.on(this._window, 'resize', this._resizeHandlerRef);

      this._loadLayerRef = this.loadLayer.bind(this);
      this.socket.on('approvedPostsPage', this._loadLayerRef);
      return this;
    },

    /* Handle the window.scroll event
     * @private
     */
    _scrollHandler: function _scrollHandler() {
      var st = this._window.pageYOffset;
      var scrollingUpwards = (st < this._lastScrollTop);
      var y = 0;
      var el;

      if (!this._listenScrollEvent) { return; }
      if (!scrollingUpwards) { y = (this._windowInnerHeight - 1); }

      this.headerElement.style.pointerEvents = 'none';

      // update timeline feedback
      var scrollPercentage, scrollViewportPixels, elem, scaledPercentage;
      scrollPercentage = 100 * st / (this._totalHeight - this._windowInnerHeight);
      scrollViewportPixels = scrollPercentage * this._windowInnerHeight / 100;

      el = document.elementFromPoint(1, y);
      elem = document.elementFromPoint(this._clientWidth - 1, scrollViewportPixels);
      if (elem && elem.classList.contains(CV.EmbedLayerPostIndicator.ELEMENT_CLASS)) {
        this._lastScrollDate = elem.dataset.timestamp;
      }
      scaledPercentage = ((100 * (this._lastScrollDate - this._firstDateMS)) / (this._lastDateMS - this._firstDateMS));
      if (scaledPercentage < 0) { scaledPercentage = 0; }
      this.timeline.update(~~((this._clientWidth - 14) * scaledPercentage / 100));

      // load layer posts
      if (el.classList.contains('posts-layer__detector') && (el.dataset.page !== this._currentMonthString)) {
        this.fillLayer(el.dataset.page, scrollingUpwards);
      }

      /* header title transition */
      if (this._availableWidth >= this.constructor.SWITCH_HEADER_MIN_WIDTH) {
        if (st < this.switchHeaderTitleHeight) {
          if (this.headerMetaElement.classList.contains('active')) {
            this.headerMetaElement.classList.remove('active');
          }
        } else if (st > this.switchHeaderTitleHeight) {
          if (!this.headerMetaElement.classList.contains('active')) {
            this.headerMetaElement.classList.add('active');
          }
        }
      }

      this._lastScrollTop = st;

      if (this._scrollTimer) { this._window.clearTimeout(this._scrollTimer); }
      this._scrollTimer = this._window.setTimeout(function() {
          this.headerElement.style.pointerEvents = '';
      }.bind(this), this._scrollTime);
    },

    /* Handle the window resize event.
     * @private
     */
    _resizeHandler: function _resizeHandler() {
      if (this._resizeTimer) { this._window.clearTimeout(this._resizeTimer); }

      this._resizeTimer = this._window.setTimeout(function(_this) {
          _this.update();
      }, this._resizeTime, this);
    },

    /* Iterates over all the layers and call its `filterPosts` method when they
     * have at least 1 or more Posts.
     * @public
     * @param {Array<string>} sourceTypes - the selected post-types on the dropdown.
     * @return {Object} EmbedLayersController.
     */
    filterItems: function filterItems (sourceTypes) {
      this.getLayers().forEach(function(layer) {
        var posts = layer.getPosts();
        if (posts.length) { layer.filterPosts(sourceTypes, this.viewType); }
      }, this);
      return this;
    },

    /* Switch the Posts Layout View.
     * @public
     * @param {string} viewType - new view type to switch. [cards|list]
     */
    updateView: function updateView (viewType) {
      if (viewType === this.viewType) { return; }

      this.viewType = viewType;

      this.getLayers().forEach(function (layer) {
        if (layer.getPosts().length) {
          this.removePosts(layer);
          this.addPosts(layer, this.getPostsRegistry(layer.page));
        }
      }, this);

      this._updateLayers();
    },

    /* Update globar variables and every layer with posts.
     * @public
     */
    update: function update () {
      this.updateGlobalVars()._updateLayers();
      return this;
    },

    /* Load a layer’s posts silently
     * @private
     */
    fillLayer: function fillLayer (dateString, scrollDirection) {
      this._listenScrollEvent = false;
      this._beforeRequest(dateString, scrollDirection);
      this._listenScrollEvent = true;
    },

    /* Return the layers widgets.
     * @public
     * @return {Object[]}
     */
    getLayers: function getLayers () {
      return this._layers || [];
    },

    getPostsRegistry: function getPostsRegistry(date) {
      return this.registry.get(date);
    },

    setPostsRegistry: function setPostsRegistry(date, posts) {
      this.registry.set(date, posts);
    },

    request: function request(id, dateString) {
      this.socket.emit('getApprovedPostsPage', id, dateString);
    },

    loadLayer: function loadLayer(postsData, dateString, scrollDirection) {
      if (!this.getPostsRegistry(dateString)) {
        this.setPostsRegistry(dateString, postsData);
      }

      if (dateString !== this._currentMonthString) { return; }
      if (this['layer_' + dateString].getPosts().length) { return; }

      var currentLayer = this.getCurrentMonthLayer();
      var prev = currentLayer.getPreviousSibling();
      var next = currentLayer.getNextSibling();
      var calculateScrollDiff = false;
      var oldScrollHeight = 0;
      var oldScrollY = 0;

      if (scrollDirection && !currentLayer._finalHeightIsKnow) {
          calculateScrollDiff = true;
          oldScrollHeight = this._body.clientHeight;
          oldScrollY = this._body.scrollTop;
      }

      this.addPosts(currentLayer, postsData);
      this.updateGlobalVars();

      if (scrollDirection) {
        var next2 = next && next.getNextSibling();
        if (next2 && this._canRemovePosts(next2)) { this.removePosts(next2); }

        if (calculateScrollDiff) {
          var newScrollHeight = this._body.clientHeight;
          var newScrollY = this._body.scrollTop;
          var scrollHeightDiff = (oldScrollHeight - newScrollHeight);
          var scrollYDiff = (oldScrollY - newScrollY);
          var diff = (newScrollY - (scrollHeightDiff - scrollYDiff));

          this._listenScrollEvent = false;
          this._window.scrollTo(0, diff);
          this._listenScrollEvent = true;
        }

        return;
      }

      var prev2 = prev && prev.getPreviousSibling();
      if (prev2 && this._canRemovePosts(prev2)) { this.removePosts(prev2); }
    },

    addPosts: function addPosts(layer, postsData) {
      layer.addPosts(postsData, this.viewType);
      layer.filterPosts(this.parent.header.filterDropdown.getSelectedSourceTypes(), this.viewType);
    },

    /* Remove/destroy posts from a layer.
     * @public
     */
    removePosts: function removePosts(layer) {
      layer.empty();
      return this;
    },

    getCurrentMonthLayer: function getCurrentMonthLayer() {
      return this['layer_' + this._currentMonthString];
    },

    updateGlobalVars: function updateGlobalVars() {
      this._totalHeight = this.mainContent.offsetHeight;
      this._windowInnerHeight = this._window.innerHeight;
      this._availableWidth = this._window.innerWidth;
      this._clientWidth = document.documentElement.clientWidth;
      this._updateAverageLayerHeight();
      this._scrollHeight = this._body.clientHeight;
      return this;
    },

    /* Creates all the required empty post layers. They will get set a default
     * height (even if empty) to display an approximated total height on the page
     * and give the illusion that the page have more content using the scrollbar
     * as visual feedback. This should encourage users to scroll down and discover
     * more content.
     * @private
     */
    _createEmptyLayers: function _createEmptyLayers(formattedPosts) {
      var frag = document.createDocumentFragment();
      this._layers = [];

      formattedPosts.forEach(function (page, index) {
        var layer = new CV.EmbedLayer({
          id: index,
          name: 'layer_' + page,
          page: page
        });
        layer.setHeight(this._averageLayerHeight);
        this._layers.push(layer);
        this.appendChild(layer);
        frag.appendChild(layer.el);
      }, this);

      this.el.appendChild(frag);

      return this;
    },

    _requestAll: function _requestAll() {
      var storedData = this.registry.get();
      Object.keys(storedData).forEach(function(propertyName) {
        var posts = storedData[propertyName];
        if (!posts) { this.request(this.voiceData.id, propertyName); }
      }, this);
    },

    _beforeRequest: function _beforeRequest(dateString, scrollDirection) {
      if (dateString === this._currentMonthString) {
        return;
      }

      this._currentMonthString = dateString;
      // prevent to append childs if the layer is already filled
      if (this['layer_' + dateString].getPosts().length) {
        return;
      }

      // load from cache
      var posts = this.getPostsRegistry(dateString);
      if (posts) {
        return this.loadLayer(posts, dateString, scrollDirection);
      }

      // request to the server
      this.request(this.voiceData.id, dateString, scrollDirection);
    },

    /* Sets the value to the _averageLayerHeight property.
     * @private
     */
    _updateAverageLayerHeight: function _updateAverageLayerHeight () {
      this._averageLayerHeight = ~~(this.averagePostTotal * this.averagePostHeight / ~~(this._availableWidth / this.averagePostWidth));
      return this;
    },

    _updateLayers: function _updateLayers() {
      this.getLayers().forEach(function (layer) {
        layer.reLayout({ averageHeight : this._averageLayerHeight });
      }, this);
    },

    /* Returns if a layer has posts to remove and also fulfills the MIN_LAYERS_POST
     * constraint.
     * @return {Boolean}
     */
    _canRemovePosts: function _canRemovePosts(layer) {
      return (layer.getPosts() && (layer.getPosts().length > this.constructor.MIN_LAYERS_POST));
    },

    /* Handles the jumpToLayer widget `activate` event.
     * @private
     */
    _activateJumpToPopover: function _activateJumpToPopover() {
      this.timeline.activate();
      this.jumpToLayer.updateActiveOption(this.getCurrentMonthLayer().page);
    },

    /* Handles the jumpToLayer widget `deactivate` event.
     * @private
     */
    _deactivateJumpToPopover: function _deactivatoTpmuJePopover() {
      this.timeline.deactivate();
    }
  }
});
