var origin = require('get-location-origin');
var moment = require('moment');
var Events = require('./../lib/events');

Class(CV, 'Embeddable').includes(NodeSupport, CustomEventSupport, CV.HelperVoice)({
  MIN_CONTENT_VIEWER_WIDTH: 420,

  prototype : {
    /**
     * @param {Object} config - the configuration object
     * @property {Object} config.voiceData - the active voice data passed through the VoicesPresenter.
     * @property {Object} config.reqQuery - the widget configurations initially passed as url params but cleaned by the server.
     */
    init : function init (config) {
      Object.keys(config).forEach(function (propertyName) {
        this[propertyName] =  config[propertyName];
      }, this);
      this._window = window;
      this.postsContainerElement = document.querySelector('.posts-container');
      this.postsCount = this._formatPagesObject(this.pagesForMonths.approved);
      this.totalPosts = this.voiceData.postsCount;
      this._updateVars();
    },

    /* Initialize its children widgets.
     * @public
     */
    run : function run() {
      this.appendChild(new CV.EmbedHeader({
        name : 'header',
        el : document.querySelector('header'),
        voiceData : this.voiceData,
        reqQuery : this.reqQuery,
        totalPosts : this.totalPosts
      }));

      if (this.totalPosts) {
        this.appendChild(new CV.EmbedLayersController({
          name : 'layersController',
          el : this.postsContainerElement,
          voiceData : this.voiceData,
          viewType : this.reqQuery.default_view,
          registry : CV.VoicePagesRegistry,
          firstPostDate : this.firstPostDate,
          lastPostDate : this.lastPostDate,
          postsCount : this.postsCount,
          socket : this.socket
        })).setup();
      } else {
        this.postsContainerElement.className += ' -no-posts';
        this.postsContainerElement.textContent = 'No posts to show';
      }

      if (this.reqQuery.background) {
        this._updateVoiceBackground();
      }

      if (this.reqQuery.description) {
        this.appendChild(new CV.EmbedVoiceDescriptionController({
          name : 'descriptionController',
          data : {
            description : this.voiceData.description,
            aboutButtonContainer : document.querySelector('.voice-intro'),
            boxContainer : document.querySelector('.description-container')
          }
        })).showDescription();

        this._updateLayerVarsRef = this._updateLayerVars.bind(this);
        this.descriptionController.bind('showDescription', this._updateLayerVarsRef);
        this.descriptionController.bind('hideDescription', this._updateLayerVarsRef);
      }

      document.querySelector('.Loading').className = 'Loading hide';

      this._bindEvents();
    },

    /* Subscribe widgets events and initialized widget’s children events if needed.
     * @private
     */
    _bindEvents : function _bindEvents() {
      this._updateVarsRef = this._updateVars.bind(this);
      Events.on(this._window, 'resize', this._updateVarsRef);

      this._displayContentViewerRef = this._displayContentViewer.bind(this);
      this.bind('post:display:detail', this._displayContentViewerRef);

      this._changePostsViewHandlerRef = this._changePostsViewHandler.bind(this);
      this.bind('changedView', this._changePostsViewHandlerRef);

      this._filterSelectionUpdatedRef = this._filterSelectionUpdated.bind(this);
      this.bind('selectionUpdated', this._filterSelectionUpdatedRef);

      return this;
    },

    /* Renders the PostDetail Content Viewer Overlay
     * @private
    */
    _displayContentViewer : function _displayContentViewer(ev) {
      ev.stopPropagation();

      if (this._innerWidth < this.constructor.MIN_CONTENT_VIEWER_WIDTH) {
        return this._sendToVoice(ev.data);
      }

      if (this.postDetailController) {
        this.postDetailController = this.postDetailController.destroy();
      }

      this.postDetailController = new CV.PostDetailController({
        socket : this.socket,
        postData : ev.data,
        registry : CV.VoicePagesRegistry,
        requestPostsSocketEventName : 'approvedPostsPage',
        responsePostsSocketEventName : 'getApprovedPostsPage'
      });

      this.postDetailController.postDetailWidget.bind('deactivate', function() {
        this.postDetailController = this.postDetailController.destroy();
      }.bind(this));
    },

    /* Sets the Voice background image
     * @private
     */
    _updateVoiceBackground : function _updateVoiceBackground() {
      var backgroundElement = document.querySelector('.voice-background-cover');

      if (this.voiceData.images.big && this.voiceData.images.big.url) {
        var image = document.createElement('img');
        image.className = "voice-background-cover-image";
        image.src = this.voiceData.images.big.url;
        backgroundElement.appendChild(image);
      }

      return this;
    },

    _changePostsViewHandler : function _changePostsViewHandler (ev) {
      ev.stopPropagation();
      this.layersController.updateView(ev.data);
    },

    _filterSelectionUpdated : function _filterSelectionUpdated (ev) {
      ev.stopPropagation();
      this.layersController.filterItems(ev.sourceTypes);
    },

    _updateLayerVars : function _updateLayerVars (ev) {
      ev.stopPropagation();
      if (!this.layersController) { return; }
      this.layersController.updateGlobalVars();
    },

    /* Opens a new tab with the voice.post url.
     * @private
     * @param {Object} data - the Post data.
     */
    _sendToVoice: function _sendToVoice(data) {
      var url = origin + '/' + data.voice.owner.profileName + '/';
        url += data.voice.slug + '/';
        url += '#!' + moment(data.publishedAt).format('YYYY-MM') + '/';
        url += data.id;

        this._openNewTab(url);
    },

    /* Creates a temporal anchor tag, sets its href, its target attribute as `_blank`
     * and trigger its click event to open a new tab.
     * @private
     */
    _openNewTab: function _openNewTab(url) {
      var anchor = document.createElement('a');
      anchor.setAttribute('href', url);
      anchor.setAttribute('target', '_blank');
      anchor.click();
      anchor = null;
    },

    _updateVars : function _updateVars() {
      this._innerWidth = this._window.innerWidth;
    },

    destroy : function destroy() {
      Widget.prototype.destroy.call(this);
      Events.off(this._window, 'resize', this._updateLayerVarsRef);
      this._updateLayerVarsRef = null;
      return null;
    }
  }
});
