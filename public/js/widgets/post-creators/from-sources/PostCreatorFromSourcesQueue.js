Class(CV, 'PostCreatorFromSourcesQueue').inherits(Widget).includes(BubblingSupport, CV.WidgetUtils)({
  ELEMENT_CLASS: 'from-sources-content-right',
  HTML: '\
    <div class="-rel">\
      <div class="from-sources-queue-success -color-grey-light -text-center -color-grey-light">\
        <svg class="from-sources-queue-success-icon -mb1">\
          <use xlink:href="#svg-thumbs-up"></use>\
        </svg>\
        <p class="from-sources-queue-success-text"></p>\
      </div>\
      <div class="from-sources-queue-onboarding -text-center">\
        <p class="-color-grey-light">Click “+ Add This” button to select the items you wish to post in this Voice. Once you do, they will show here and you’ll be able to edit their title and description before posting them.</p>\
      </div>\
      <div class="from-sources-queue-list -text-center"></div>\
    </div>',

  prototype: {
    _index: 0,
    init: function init(config)  {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.list = this.el.querySelector('.from-sources-queue-list');
      this.onboarding = this.el.querySelector('.from-sources-queue-onboarding');
      this.success = this.el.querySelector('.from-sources-queue-success');
      this.successText = this.success.querySelector('.from-sources-queue-success-text');

      this.loader = new CV.Loading().render(this.el).center().disable();

      this._deleteFromQueueRef = this._deleteFromQueue.bind(this);
      this.bind('post:moderate:delete', this._deleteFromQueueRef);
    },

    /* Removes a specific Post from the queue.
     * @private
     * @listen 'post:moderate:delete' event.
     */
    _deleteFromQueue: function _deleteFromQueue(ev) {
      var childIndex = this.children.indexOf(ev.data.parent);
      if (childIndex >= 0) {
        this.children[childIndex].unedit().destroy();
        this._index--;
        if (this._index === 0) {
          this.showOnboarding();
        }
      }
    },

    /* Hides the onboarding and success messages.
     * @public
     * @return this
     */
    setSearchingState: function setSearchingState() {
      this.hideOnboarding().hideSuccess();
      return this;
    },

    /* Hides the messages and display the loader.
     * @public
     * @return this
     */
    setAddingPost: function setAddingPost() {
      this.setSearchingState();
      this.loader.enable();
      return this;
    },

    /* If it has 0 posts in queue, displays the onboarding message.
     * @public
     * @return this
     */
    showOnboarding: function showOnboarding() {
      if (this._index) return;
      this.onboarding.classList.add('active');
      return this;
    },

    /* @public
     * @return this
     */
    hideOnboarding: function hideOnboarding() {
      this.onboarding.classList.remove('active');
      return this;
    },

    hideSuccess: function hideSuccess() {
      this.success.classList.remove('active');
      return this;
    },

    showSuccess: function showSuccess() {
      this.success.classList.add('active');
      return this;
    },

    /* Prepend the new Post(s) Widgets to the Queue.
     * @public
     * @param {Array} postsData - the postsData
     */
    addPosts: function addPosts(postsData) {
      var fragment = document.createDocumentFragment();
      this.hideOnboarding().hideSuccess();

      postsData.forEach(function (post) {
        post.name = 'post_' + this._index;
        this.appendChild(CV.EditablePost.create(post))
          .edit().addImageControls().addRemoveButton()
          .render(fragment);
        this._index++;
      }, this);

      this.list.insertBefore(fragment, this.list.firstChild);
      this.loader.disable();
    },

    setSuccessState: function setSuccessState() {
      var text = this._index + ' items posted';
      if (this.canPostDirectly === false) text += ' to the moderation queue';
      this.dom.updateText(this.successText, text);

      while (this.children.length > 0) {
        this.children[0].destroy();
      }

      this._index = 0;
      this.showSuccess();
    }
  }
});

