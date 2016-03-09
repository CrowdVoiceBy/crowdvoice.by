/* globals App */
var Person = require('../../../lib/currentPerson')
  , API = require('../../../lib/api')
  , Events = require('../../../lib/events')
  , Velocity = require('velocity-animate');

Class(CV, 'PostCreatorFromSources').inherits(CV.PostCreator)({
  ELEMENT_CLASS: 'cv-post-creator post-creator-from-sources',

  HTML: '\
    <div>\
      <div class="input-error-message -on-error -abs -color-negative"></div>\
      <header class="cv-post-creator__header -clearfix">\
        <div class="from-sources__header-main-contents -full-height">\
          <div data-pick-source class="-full-height -pt1 -pl1">\
            <p class="from-sources-pick-source-label -inline-block">Pick a Source to add content</p>\
          </div>\
          <div class="from-sources-twitter-auth-wrapper -pt1 -pl1 -full-height -hide">\
            <p class="-inline-block">Please connect a twitter account to use this source.\
              <span class="ui-has-tooltip">\
                <em class="-inline-block -color-neutral-mid">Why?</em>\
                <i class="ui-tooltip -bottom">CrowdVoice.by searches this service via Twitter “Search APIs.”<br/>The APIs of this service requires that any requests for their information (such as a search) must come from an “authorized” account.</i>\
              </span>\
            </p>\
            <div class="twitter-auth-button-holder -inline-block"></div>\
          </div>\
          <div class="from-sources-header-input-wrapper -full-height -rel -hide">\
            <svg class="input-search-icon -s20 -abs -color-neutral-mid">\
              <use xlink:href="#svg-search"></use>\
            </svg>\
          </div>\
        </div>\
      </header>\
      <div class="cv-post-creator__content -abs"></div>\
      <div class="cv-post-creator__disable"></div>\
    </div>',

  DEFAULT_ERROR_MESSAGE: 'There was a problem searching for content.',

  prototype: {
    el: null,
    header: null,
    content: null,

    _currentSource: '',
    _addedPostsCounter: 0,
    _inputKeyUpHandlerRef: null,
    _inputKeyUpTimer: null,
    _inputLastValue: null,
    _postsAdded: false,

    /* @override
     */
    init: function init(config) {
      CV.PostCreator.prototype.init.call(this, config);
      this.el = this.element[0];
      this.header = this.el.querySelector('.cv-post-creator__header');
      this.content = this.el.querySelector('.cv-post-creator__content');
      this.errorMessage = this.el.querySelector('.input-error-message');
      this.inputWrapper = this.el.querySelector('.from-sources-header-input-wrapper');
      this.twitterAuthWrapper = this.el.querySelector('.from-sources-twitter-auth-wrapper');
      this.pickSourceWrapper = this.el.querySelector('[data-pick-source]');
      this.addCloseButton()._setup()._bindEvents();

      if (!window.localStorage['cvby__saw-post-creator']) {
        window.localStorage['cvby__saw-post-creator'] = true;
        setTimeout(function (that) {
          that.sourcesDropdown.activate();
        }, 500, this);
      } else {
        this.sourcesDropdown.setDefaultOption();
        this._setNormalSearchState();
      }
    },

    /* Appends any required children.
     * @private
     * @return [PostCreatorFromUrl]
     */
    _setup: function _setup() {
      this.appendChild(new CV.PostCreatorPostButton({
        name: 'postButton',
        className: '-float-right -full-height -color-border-grey-light'
      })).render(this.header, this.header.firstChild).disable();

      this.appendChild(new CV.PostCreatorFromSourcesDropdown({
        name: 'sourcesDropdown',
        className: '-float-left -full-height'
      })).render(this.header, this.header.firstChild);

      this.appendChild(new CV.UI.Button({
        name: 'authTwitterButton',
        className: 'small',
        data: {value: 'Connect account'}
      })).render(this.twitterAuthWrapper.querySelector('.twitter-auth-button-holder'));

      if (!Person.get()) {
        this.appendChild(new CV.PopoverTwitterNotLoggedIn({
          name: 'twitterAuthNotLoggedInPopoverContent'
        }));

        this.appendChild(new CV.PopoverBlocker({
          name: 'twitterAuthNotLoggedInPopover',
          placement: 'bottom',
          className: 'popover-twitter-not-logged-in',
          content: this.twitterAuthNotLoggedInPopoverContent.el
        })).render(this.twitterAuthWrapper.querySelector('.twitter-auth-button-holder'));
      }

      this.appendChild(new CV.InputClearable({
        name: 'input',
        placeholder: 'Search for content',
        inputClass: '-block -lg -br0 -bw0 -full-height',
        className: '-full-height'
      })).render(this.inputWrapper, this.inputWrapper.firstChild);

      this.appendChild(new CV.PostCreatorFromSourcesQueue({
        name: 'queuePanel',
        className: '-color-bg-grey-lighter -color-border-grey-light -full-height -float-right',
        canPostDirectly: Person.canPostDirectlyOnVoice(App.Voice.data)
      })).render(this.content);

      this.appendChild(new CV.PostCreatorFromSourcesResults({
        name: 'resultsPanel',
        className: '-color-bg-white -full-height -overflow-hidden'
      })).render(this.content);

      return this;
    },

    /* Binds the events for the InputClearable (keydown enter)
     * @private
     * @return [PostCreatorFromUrl]
     */
    _bindEvents: function _bindEvents() {
      CV.PostCreator.prototype._bindEvents.call(this);

      this._authTwitterHandlerRef = this._authTwitterHandler.bind(this);
      Events.on(this.authTwitterButton.el, 'click', this._authTwitterHandlerRef);

      if (this.twitterAuthNotLoggedInPopoverContent) {
        this._authTwitterAccountRef = this._authTwitterAccount.bind(this);
        this.twitterAuthNotLoggedInPopoverContent.bind('connect-twitter', this._authTwitterAccountRef);
      }

      this._sourceChangedRef = this._sourceChanged.bind(this);
      this.sourcesDropdown.bind('sourceChanged', this._sourceChangedRef);

      this._inputKeyUpHandlerRef = this._inputKeyUpHandler.bind(this);
      Events.on(this.input.getElement(), 'keyup', this._inputKeyUpHandlerRef);

      this._addPostRef = this._addPost.bind(this);
      this.resultsPanel.bind('addPost', this._addPostRef);

      this._postDeletedRef = this._postDeleted.bind(this);
      this.bind('post:moderate:delete', this._postDeletedRef);

      this.postButton.bind('buttonClick', this._handlePostButtonClick.bind(this));

      return this;
    },

    /* Handles the keyup event on the input. It will debounce the event for 500ms.
     * @private
     */
    _inputKeyUpHandler: function _inputKeyUpHandler() {
      window.clearTimeout(this._inputKeyUpTimer);
      this._inputKeyUpTimer = window.setTimeout(this._validateInputValue.bind(this), 500);
    },

    /* Checks if a new request can be made.
     * @private
     */
    _validateInputValue: function _validateInputValue() {
      var inputValue = this.input.getValue();
      this._inputKeyUpTimer = null;
      if ((inputValue.length <= 2) || (inputValue === this._inputLastValue)) return;
      this._inputLastValue = inputValue;
      this._removeErrorState()._setSearching()._request(inputValue);
    },

    /* Calls the `postPreview` API to generate a preview.
     * @private
     */
    _addPost: function _addPost(ev) {
      this.queuePanel.setAddingPost();

      if (this.resultsPanel.source.children.indexOf(ev.data) >= 0) {
        Velocity(ev.data.element[0], 'slideUp', {delay: 500, duration : 400});
      }

      var _data = {};
      if (ev.data.data.sourceUrl) {
        _data.url = ev.data.data.sourceUrl;
      }
      if (ev.data.data.id_str) {
        _data.id_str = ev.data.data.id_str;
      }
      API.postPreview({
        profileName: App.Voice.data.owner.profileName,
        voiceSlug: App.Voice.data.slug,
        data: _data
      }, this._requestPreviewHandler.bind(this, ev));
    },

    /* `postPreview` API preview call response handler.
     * Add the preview to the queue.
     * @private
     */
    _requestPreviewHandler: function _requestPreviewHandler(ev, err, response) {
      if (err || response.error) {
        console.log(response);

        var revert = true;

        this.queuePanel.loader.disable();

        var errorMessage = '';
        if (response.responseJSON) {
          errorMessage = response.responseJSON.status;
        } else if (typeof response.error === 'string') {
          // url already exists, no need to show the item back
          errorMessage = response.error;
          revert = false;
        } else {
          errorMessage = response.status + ' - ' + response.statusText;
        }

        if (revert) {
          if (this.resultsPanel.source.children.indexOf(ev.data) >= 0) {
            Velocity(ev.data.el, 'slideDown', {duration : 400});
          }
        }

        return this._setErrorState({message: errorMessage});
      }

      if ((response instanceof Array) === false) {
        response = [response];
      }

      this._addedPostsCounter += response.length;
      this.postButton.updateCounter(this._addedPostsCounter);
      this.queuePanel.addPosts(response);
      this._enabledPostButton();
    },

    /* Listener handler for when a Post was removed from the queuePanel,
     * decrement the post button couter label and disable the button if it
     * has reach back to zero.
     * @private
     */
    _postDeleted: function _postDeleted() {
      this._addedPostsCounter--;
      this.postButton.updateCounter(this._addedPostsCounter);
      if (!this._addedPostsCounter) {
        this._disablePostButton();
      }
    },

    /* PostButton click handler. Calls the `postCreate` API to save the current Post displayed as preview.
     * @private
     */
    _handlePostButtonClick: function _handlePostButtonClick() {
      this.disable();
      this._disablePostButton();
      this.queuePanel.setAddingPost();

      var posts = this.queuePanel.children.map(function(post) {
        return post.getEditedData();
      });

      API.postCreate({
        profileName: App.Voice.data.owner.profileName,
        voiceSlug: App.Voice.data.slug,
        posts: posts
      }, this._createPostResponse.bind(this));
    },

    _createPostResponse: function _createPostResponse(err, response) {
      var errorMessage = '';
      if (err) {
        errorMessage = 'Error - ' + response.status;
        return this._setErrorState({message: errorMessage}).enable();
      }

      this._setSuccessState().enable();
    },

    _setSuccessState: function _setSuccessState() {
      this.queuePanel.setSuccessState();
      this.queuePanel.loader.disable();
      this._addedPostsCounter = 0;
      this.postButton.updateCounter(this._addedPostsCounter);
      this._postsAdded = true;
      return this;
    },

    /* Handles the sources dropdown change event.
     * @private
     */
    _sourceChanged: function _sourceChanged(ev) {
      this._currentSource = ev.source;
      this._removeErrorState();

      this._updateInputPlaceholder(this._currentSource);

      if (this._currentSource === 'twitter') {
        CV.PostCreatorFromSourcesSourceTwitter.isAuth(function (err, res) {
          if (err) {
            this._setTwitterAuthState();
            return this._setErrorState({
              message: res.errors[0]
            });
          }

          if (res === true) {
            this._setNormalSearchState();
            return this._autoSearchSourceUpdate();
          }

          this._setTwitterAuthState();
        }.bind(this));
      } else {
        this._setNormalSearchState();
        this._autoSearchSourceUpdate();
      }
    },

    _updateInputPlaceholder: function _updateInputPlaceholder(source) {
      var sourceName = '';
      switch(source) {
        case 'twitter':
          sourceName = 'Twitter';
          break;
        case 'youtube':
          sourceName = 'Youtube';
          break;
        case 'googleNews':
          sourceName = 'Google News';
          break;
      }
      this.dom.updateAttr('placeholder', this.input.getElement(), 'Search for content in ' + sourceName);
    },

    /* Checks if it should perform and new request based on the new state.
     * Useful for when changing the source and a previous query has been made.
     * @private
     */
    _autoSearchSourceUpdate: function _autoSearchSourceUpdate() {
      if (this._query) {
        this.input.setValue(this._query);
        this._setSearching()._request(this._query);
      }
    },

    _setTwitterAuthState: function _setTwitterAuthState() {
      this.inputWrapper.classList.add('-hide');
      this.twitterAuthWrapper.classList.remove('-hide');
      this.pickSourceWrapper.classList.add('-hide');
      return this;
    },

    _setNormalSearchState: function _setNormalSearchState() {
      this.inputWrapper.classList.remove('-hide');
      this.twitterAuthWrapper.classList.add('-hide');
      this.pickSourceWrapper.classList.add('-hide');
      this.input.getElement().focus();
      return this;
    },

    /* Opens the twitter authorization popup and checks when it gets closed.
     * @private
     */
    _authTwitterHandler: function _authTwitterHandler() {
      if (!Person.get()) {
        this.twitterAuthNotLoggedInPopover.activate();
        return;
      }
      this._authTwitterAccount();
    },

    _authTwitterAccount: function _authTwitterAccount() {
      if (this.twitterAuthNotLoggedInPopover) {
        this.twitterAuthNotLoggedInPopover.deactivate();
      }

      var _this = this;
      window.authWindow = window.open('/twitter/oauth', 'twitterWindow', 'height=600,width=500');

      var interval = window.setInterval(function () {
        if (window.authWindow === null || window.authWindow.closed) {
          window.clearInterval(interval);
          if (window.authWindow.CV && window.authWindow.CV.oauthCallbackHasTwitterCredentials) {
            _this._setNormalSearchState()._removeErrorState()._autoSearchSourceUpdate();
          }
        }
      }, 1000);
    },

    /* Calls our search API endpoint to search for content on the current source.
     * @private
     */
    _request: function _request(query) {
      this._query = query;

      var args = {
        profileName: App.Voice.data.owner.profileName,
        voiceSlug: App.Voice.data.slug,
        source: this._currentSource,
        data: {
          query: this._query
        }
      };

      API.searchPostsInSource(args, this._requestResponseHandler.bind(this));
    },

    _requestResponseHandler: function _requestResponseHandler(err, response) {
      if (err) {
        return this._setErrorState({
          message: response.status + ' - ' + response.statusText
        });
      }

      var responseLength = 0;
      if (response instanceof Array) {
        responseLength = response.length;
      } else if (response.videos !== undefined) {
        responseLength = response.videos.length;
      }

      if (!responseLength) {
        this._setNoResultsState();
      } else {
        this.resultsPanel.renderResults(this._currentSource, response, this._query, responseLength);
        this._setResultsState();
      }
    },

    _showContent: function _showContent() {
      this.content.classList.add('active');
      return this;
    },

    _hideContent: function _hideContent() {
      this.content.classList.remove('active');
      return this;
    },

    _setSearching: function _setSearching() {
      this._showContent();
      this.resultsPanel.setSearchingState();
      this.queuePanel.setSearchingState();
      return this;
    },

    _setNoResultsState: function _setNoResultsState() {
      this._showContent();
      this.resultsPanel.setNoResultsState(this._query);
      return this;
    },

    _setResultsState: function _setResultsState() {
      this._showContent();
      this.resultsPanel.setResultsState();
      this.queuePanel.showOnboarding();
      return this;
    },

    /* Sets the error state.
     * @private
     * @return [PostCreatorFromUrl]
     */
    _setErrorState: function _setErrorState(config) {
      if (config && config.message) {
        this.dom.updateText(this.errorMessage, config.message);
      } else {
        this.dom.updateText(this.errorMessage, this.constructor.DEFAULT_ERROR_MESSAGE);
      }

      this.el.classList.add('has-error');

      return this;
    },

    /* Remove error messages.
     * @private
     * @return [CV.PostCreatorFromUrl]
     */
    _removeErrorState: function _removeErrorState() {
      this.el.classList.remove('has-error');
      return this;
    },

    /* Enables the Post Button.
     * @private
     * @return [PostCreatorFromUrl]
     */
    _enabledPostButton: function _enabledPostButton() {
      this.postButton.enable();
      return this;
    },

    /* Disables the Post Button.
     * @private
     * @return [PostCreatorFromUrl]
     */
    _disablePostButton: function _disablePostButton() {
      this.postButton.disable();
      return this;
    },

    /* @override
     */
    _activate: function _activate() {
      CV.PostCreator.prototype._activate.call(this);
      this.input.getElement().focus();
    },

    /* @override
     */
    _deactivate: function _deactivate() {
      CV.PostCreator.prototype._deactivate.call(this);

      if (this._postsAdded) {
        window.location.reload();
      }
    },

    /* @override
     */
    _enable: function _enable() {
      CV.PostCreator.prototype._enable.call(this);
      this.input.getElement().focus();
    },

    /* @override
     */
    _disable: function _disable() {
      CV.PostCreator.prototype._disable.call(this);
      this.input.getElement().blur();
    },

    /* @override
     */
    destroy: function destroy() {
      Events.off(this.authTwitterButton.el, 'click', this._authTwitterHandlerRef);
      this._authTwitterHandlerRef = null;

      Events.off(this.input.getElement(), 'keyup', this._inputKeyUpHandlerRef);
      this._inputKeyUpHandlerRef = null;

      CV.PostCreator.prototype.destroy.call(this);
      return null;
    }
  }
});
