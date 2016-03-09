/* globals App */
var Person = require('./../lib/currentPerson')
  , API = require('./../lib/api')
  , Events = require('./../lib/events')
  , constants = require('./../lib/constants')
  , inlineStyle = require('./../lib/inline-style');

Class(CV, 'VoiceView').includes(CV.WidgetUtils, CV.VoiceHelper, NodeSupport, CustomEventSupport)({
  prototype: {
    LAYER_CLASSNAME: 'cv-voice-posts-layer__detector',

    /* Either the voice allows OR the user can create new posts for the current voice - Boolean */
    allowPosting: false,
    /* The user can edit posts on the current voice>? - Boolean */
    allowPostEditing: false,

    _resizeTimer: null,
    _resizeTime: 250,
    _listenScrollEvent: true,
    _lastScrollTop: 0,
    _scrollTimer: null,
    _scrollTime: 250,
    /* layer offset left to perform hit-test on layer elements
     * sidebar = 60, main-container-padding-left = 40
     */
    _layersOffsetLeft: 70,

    /* Tell if a postId has been pased on the url to display the content viewer.
     * If a `postId` is detected on the `_checkInitialHash` method the value
     * of this property will be changed to true and the _showContentViewerPostId
     * property will hold the post id value, so when the first layer data
     * and the `_layerLoadedHandler` method is run the content viewer will
     * be triggered.
     * @property {Boolean}
     */
    _showContentViewer: false,

    /* @property <string> - the post id encoded found on the initial url.
    */
    _showContentViewerPostId: '',

    /* @type {Object} VoiceModel
    */
    data: null,

    init: function init(config) {
      Object.keys(config || {}).forEach(function(propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      this._window = window;
      this._body = document.body;
      this.pagesApproved = this._formatPagesObject(this.pagesForMonths.approved);
      this.pagesUnapproved = this._formatPagesObject(this.pagesForMonths.unapproved);
      this.unapprovedPostsCount = this._getTotalPostCount(this.pagesForMonths.unapproved);

      this._setup()._updateVoiceInfo()._setupVoiceWidgets();
    },

    _setup: function _setup() {
      window.CardHoverWidget.register(document.querySelector('.voice-info__author'), this.data.owner);

      if (this.data.postsCount === 0) {
        this._updateStateForEmptyVoice();
      } else {
        this._appendLayersManager();
        this._checkInitialHash();
        this._bindEvents();
      }

      return this;
    },

    /* Updates DOM Elements that are not direct widgets but are part of
     * the Voice view such as the backgroundCover.
     * @private
     */
    _updateVoiceInfo: function _updateVoiceInfo() {
      if (this.data.images.big && this.data.images.big.url) {
        var image = document.createElement('img');
        image.className = "voice-background-cover-image";
        image.src = this.data.images.big.url;
        this.backgroundElement.appendChild(image);
      } else {
        this.backgroundElement.className += ' -colored-background';
      }
      return this;
    },

    /* Instantiate Widgets that give special behaviour to VoiceView, such
     * as the AutoHide Header, Expandable Sidebar, Voice Footer, etc.
     * @private
     * @return [CV.VoiceView]
     */
    _setupVoiceWidgets: function _setupVoiceWidgets() {
      if (!Person.get()) {
        this.appendChild(new CV.UI.Button({
          name : 'createVoiceButton',
          className : 'small primary -mr2',
          data : {value: 'Create Voice'}
        })).render(App.header.buttonActionsWrapper, App.header.buttonActionsWrapper.firstElementChild);

        Events.on(this.createVoiceButton.el, 'click', function() {
          window.location.href = '/login';
        });
      }

      if (Person.ownerOf('voice', this.data.id)) {
        App.header.removeCreateDropdown();

        this.appendChild(new CV.UI.Button({
          name : 'editVoiceButton',
          className : 'small -mr2',
          data : {value: 'Edit this Voice'}
        })).render(App.header.buttonActionsWrapper, App.header.buttonActionsWrapper.firstElementChild);

        this._editVoiceButtonClickedRef = this._editVoiceButtonClicked.bind(this);
        Events.on(this.editVoiceButton.el, 'click', this._editVoiceButtonClickedRef);

        if (this.data.status === constants.VOICE.STATUS_DRAFT) {
          this.appendChild(new CV.VoicePublishButton({
            name: 'voicePublishButton',
            data: {voice: this.data},
            className: '-inline-block -mr1'
          })).render(App.header.buttonActionsWrapper, App.header.buttonActionsWrapper.firstElementChild);
        }
      }

      // display the create content button if the voice allows posting.
      if (this.allowPosting) {
        this.appendChild(new CV.VoiceAddContent({
          name : 'voiceAddContent',
          voice : this.data
        })).render(document.body);
      }

      this.appendChild(new CV.VoiceFooter({
        name : 'voiceFooter',
        voice : this.data,
        allowPosting : this.allowPosting,
        allowPostEditing : this.allowPostEditing,
        voiceScrollableArea : this.scrollableArea,
        postCount : this.data.postsCount,
        unapprovedPostsCount: this.unapprovedPostsCount,
        followerCount : this.data.followers.length,
        relatedVoices : this.relatedVoices,
        contributors : this.contributors
      })).render(document.querySelector('.cv-main-header'));

      this.appendChild(new CV.VoiceHeader({
        name : 'voiceHeader',
        element : document.getElementsByClassName('cv-main-header')[0],
        backgroundElement : this.backgroundElement,
        footerVoiceTitle : document.getElementsByClassName('voice-footer-meta-wrapper')[0],
        scrollableArea : this.scrollableArea
      }));

      return this;
    },

    /* Handle the empty voice state (no posts).
     * @private
     */
    _updateStateForEmptyVoice: function _updateStateForEmptyVoice() {
      document.querySelector('.cv-main-content').insertAdjacentHTML('beforeend', '\
          <section class="voice-posts -rel">\
            <div class="cv-voice-posts-layer first">\
              <div class="cv-voice-posts-layer__posts"></div>\
            </div>\
          </section>');

      this.appendChild(new CV.VoiceAboutBox({
        name: 'voiceAboutBox',
        description: this.data.description
      })).render(document.querySelector('.cv-voice-posts-layer__posts'));

      inlineStyle(this.voiceAboutBox.el, {
        top: '20px',
        left: '20px'
      });

      this.showAboutBoxRef = this.showAboutBoxButtonHandler.bind(this);
      Events.on(this.aboutBoxButtonElement, 'click', this.showAboutBoxRef);

      this._deactivateButtonRef = this._deactivateButton.bind(this);
      CV.VoiceAboutBox.bind('activate', this._deactivateButtonRef);

      this._activateButtonRef = this._activateButton.bind(this);
      CV.VoiceAboutBox.bind('deactivate', this._activateButtonRef);

      CV.VoiceAboutBox.bind('deactivate', function() {
        localStorage['cvby__voice' + this.data.id + '__about-read'] = true;
      }.bind(this));

      if (!localStorage['cvby__voice' + this.data.id + '__about-read']) {
        this.voiceAboutBox.activate();
      }
    },

    /* Checks if we have provided the information required before
     * appendind the VoicePostLayersManager Class. This method should be
     * called only once, right now it's being called by the init method.
     * @private
     * @return undefined
     */
    _appendLayersManager: function _appendLayersManager() {
      if (!this.data.firstPostDate || !this.data.lastPostDate) {
        return console.warn('VoicePostLayersManager required firstPostDate or lastPostDate properties NOT to empty strings');
      }

      this.appendChild(new CV.VoicePostLayersVoiceAbstract({
        name: 'voicePostLayersManager',
        id: this.data.id,
        registry: CV.VoicePagesRegistry,
        pages: this.pagesApproved,
        description: this.data.description,
        scrollableArea: this.scrollableArea,
        allowPostEditing: this.allowPostEditing,
        _socket: this._socket
      })).render(document.querySelector('.cv-main-content')).setup();

      return this;
    },

    /* Checks the window hash to determinate which posts to requests for initial rendering.
     * If the hash does not match the format 'YYYY-MM' it will default to newest month, requesting the latest posts.
     * If necessary, it should scroll to the specific month to load, disabling the scroll-sniffing during the scrollTo animation.
     * This method should be run only once from init.
     * @private
     */
    _checkInitialHash: function _checkInitialHash() {
      var hash = window.location.hash.replace(/^#!/, '')
        , matches = hash.match(/(^\d{4}-\d{2})(\/\w+)?/);

      if (!hash || !matches) {
        return this.voicePostLayersManager.loadDefaultLayer();
      }

      var date = matches[1]
        , postId = matches[2];

      if (postId) {
        postId = postId.replace(/^\//,'');
        if (/^[a-z0-9]{12}?/i.test(postId)) {
          this._showContentViewer = true;
          this._showContentViewerPostId = postId;
        }
      }

      if (date && /^\d{4}-\d{2}/.test(date)) {
        var _date = date.split('-')
          , year = _date[0]
          , month = _date[1]
          , _year = this.pagesForMonths.approved[year];

        if (_year) {
          var _month = _year[month];
          if (_month) {
            return this.voicePostLayersManager._jumpToHandlerRef({
              dateString: month,
              page: _month.page
            });
          }
        }
      }

      this.voicePostLayersManager.loadDefaultLayer();
    },

    _bindEvents: function _bindEvents() {
      this._scrollHandlerRef = this._scrollHandler.bind(this);
      Events.on(this.scrollableArea, 'scroll', this._scrollHandlerRef);

      this._resizeHandlerRef = this._resizeHandler.bind(this);
      Events.on(this._window, 'resize', this._resizeHandlerRef);

      this.showAboutBoxRef = this.showAboutBoxButtonHandler.bind(this);
      Events.on(this.aboutBoxButtonElement, 'click', this.showAboutBoxRef);

      this._deactivateButtonRef = this._deactivateButton.bind(this);
      CV.VoiceAboutBox.bind('activate', this._deactivateButtonRef);

      this._activateButtonRef = this._activateButton.bind(this);
      CV.VoiceAboutBox.bind('deactivate', this._activateButtonRef);

      this.layerLoadedRef = this._layerLoadedHandler.bind(this);
      this.voicePostLayersManager.bind('layerLoaded', this.layerLoadedRef);

      this.layerManagerReadyRef = this._layerManagerReadyHandler.bind(this);
      this.voicePostLayersManager.bind('ready', this.layerManagerReadyRef);

      this.bind('post:display:detail', function (ev) {
        this._displayGallery(ev);
      }.bind(this));

      this.bind('post:moderate:delete', this._postDelete.bind(this));
    },

    _editVoiceButtonClicked: function _editVoiceButtonClicked() {
      App.showVoiceEditModal({
        voiceEntity: this.data,
        ownerEntity: Person.get()
      });
    },

    /* Listens the `post:moderate:delete` event bubbling up.
     * Deletes an specific published Post record.
     * @private
     * @return undefined
     */
    _postDelete: function _postDelete(ev) {
      ev.stopPropagation();

      if (Person.ownerOf('voice', ev.data.parent.voice.id) === false) {
        throw new Error('Not autorized to perform this action.');
      }

      API.postDelete({
        profileName: App.Voice.data.owner.profileName,
        voiceSlug: App.Voice.data.slug,
        postId: ev.data.parent.id
      }, function(err, res) {
        console.log(err);
        console.log(res);

        if (err) return;

        this.voiceFooter.updatePostCount(--this.data.postsCount);

        var layer = ev.data.parent.parent;
        layer.removePost(ev.data.parent);
      }.bind(this));
    },
    /* Renders the PostDetail Overlay
     * @private
     * @param {Object} ev - the Post instance.
     */
    _displayGallery: function _displayGallery(ev) {
      if (this.postDetailController) {
        this.postDetailController = this.postDetailController.destroy();
      }

      if (ev.data.approved) {
        this.postDetailController = new CV.PostDetailController({
          socket: this._socket,
          postData: ev.data,
          registry: CV.VoicePagesRegistry,
          requestPostsSocketEventName: 'approvedPostsPage',
          responsePostsSocketEventName: 'getApprovedPostsPage'
        });
      }

      if (ev.data.approved === false) {
        this.postDetailController = new CV.PostDetailControllerUnapproved({
          socket: this._socket,
          data: ev.data
        });
      }

      this.postDetailController.postDetailWidget.bind('deactivate', function() {
        this.postDetailController = this.postDetailController.destroy();
      }.bind(this));
    },

    loadLayer: function loadLayer(dateString, scrollDirection) {
      this._listenScrollEvent = false;
      this.voicePostLayersManager._beforeRequest(dateString, scrollDirection);
      this._listenScrollEvent = true;
    },

    /* Handle the scrollableArea scroll event.
     * @private
     */
    _scrollHandler: function _scrollHandler() {
      var st = this.voicePostLayersManager.getScrollTop();
      var scrollingUpwards = (st < this._lastScrollTop);
      var y = 0;
      var el;

      this.voiceFooter.el.style.pointerEvents = 'none';
      this.voiceHeader.el.style.pointerEvents = 'none';
      if (this.voiceAddContent) {
        this.voiceAddContent.el.style.pointerEvents = 'none';
      }

      if (!this._listenScrollEvent) { return; }

      if (!scrollingUpwards) {
        y = (this.voicePostLayersManager._windowInnerHeight - 1);

        this.voicePostLayersManager.getLayers().forEach(function(layer) {
          var indicators = layer.getIndicators();
          if (indicators.length) {
            indicators.forEach(function(indicator) {
              indicator.removeIndex();
            });
          }
        });
      } else {
        this.voicePostLayersManager.getLayers().forEach(function(layer) {
          var indicators = layer.getIndicators();
          if (indicators.length) {
            indicators.forEach(function(indicator) {
              indicator.addIndex();
            });
          }
        });
      }

      el = document.elementFromPoint(this._layersOffsetLeft, y);

      if (el.classList.contains(this.LAYER_CLASSNAME)) {
        if (el.dataset.page !== this.voicePostLayersManager._currentMonthString) {
          this.loadLayer(el.dataset.page, scrollingUpwards);
        }
      }

      this._lastScrollTop = st;

      if (this._scrollTimer) {
        this._window.clearTimeout(this._scrollTimer);
      }

      this._scrollTimer = this._window.setTimeout(function() {
        this.voiceFooter.el.style.pointerEvents = '';
        this.voiceHeader.el.style.pointerEvents = '';
        if (this.voiceAddContent) {
          this.voiceAddContent.el.style.pointerEvents = '';
        }
        this.voicePostLayersManager.loadImagesVisibleOnViewport();
      }.bind(this), this._scrollTime);
    },

    /* Handle the window resize event.
     * @private
     */
    _resizeHandler: function _resizeHandler() {
      var _this = this;

      if (this._resizeTimer) {
        this._window.clearTimeout(this._resizeTimer);
      }

      this._resizeTimer = this._window.setTimeout(function() {
        _this.voicePostLayersManager.update();
      }, this._resizeTime);
    },

    _deactivateButton: function _deactivateButton() {
      this.aboutBoxButtonElement.style.display = 'none';
    },

    _activateButton: function _activateButton() {
      this.aboutBoxButtonElement.style.display = '';
    },

    showAboutBoxButtonHandler: function showAboutBoxButtonHandler() {
      CV.VoiceView.dispatch('voiceAboutBox:show');
    },

    /* Initialize child widgets that depends on layerManager to be loaded with content.
     * @method _layerManagerReadyHandler <private> [Function]
     */
    _layerManagerReadyHandler: function _layerManagerReadyHandler(data) {
      var timestamp = data.layer.getIndicators()[0].getTimestamp();

      if (this.voiceFooter) {
        this.voiceFooter.setTimelineInitialDate(timestamp);
        this.voiceFooter.createJumpToDateBubble(this.pagesForMonths.approved);
      }

      this.voicePostLayersManager.unbind('ready', this.layerManagerReadyRef);
      this.layerManagerReadyRef = null;
    },

    /* Layer loaded handler
     * @private
     */
    _layerLoadedHandler: function _layerLoadedHandler(data) {
      var _this = this;

      if (this.voiceFooter) {
        this.voiceFooter.updateTimelineVars();
      }

      if (this._showContentViewer) {
        var postInstance;
        this._showContentViewer = false;

        data.target.getLayers().some(function(layer) {
          return layer.getPosts().some(function(post) {
            if (post.id === _this._showContentViewerPostId) {
              postInstance = post;
              return true;
            }
          });
        });

        if (postInstance) this._displayGallery({data: postInstance});
      }
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);

      window.CardHoverWidget.unregister(document.querySelector('.voice-info__author'));

      Events.off(this.scrollableArea, 'scroll', this._scrollHandlerRef);
      this._scrollHandlerRef = null;

      Events.off(this.aboutBoxButtonElement, 'click', this.showAboutBoxRef);
      this.showAboutBoxRef = null;

      Events.off(this._window, 'resize', this._resizeHandlerRef);
      this._resizeHandlerRef = null;

      if (this._resizeTimer) {
        this._window.clearTimeout(this._resizeTimer);
      }

      if (this.editVoiceButton) {
        Events.off(this.editVoiceButton.el, 'click', this._editVoiceButtonClickedRef);
        this._editVoiceButtonClickedRef = null;
      }

      return null;
    }
  }
});
