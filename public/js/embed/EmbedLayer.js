var Waterfall = require('./../lib/waterfall');

Class(CV, 'EmbedLayer').inherits(Widget).includes(BubblingSupport)({
  ELEMENT_CLASS : 'posts-layer -rel -clearfix',
  HTML : '\
    <section>\
      <div class="posts-layer__detector"></div>\
      <div class="posts-layer__posts"></div>\
      <div class="cv-voice-posts-layer__ticks"></div>\
    </section>',

  prototype : {
    waterfall : null,
    _postWidgets : null,
    _indicatorWidgets : null,

    init : function init (config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.postsContainer = this.el.querySelector('.posts-layer__posts');
      this.ticksContainerElement = this.el.querySelector('.cv-voice-posts-layer__ticks');
      this.el.querySelector('.posts-layer__detector').dataset.date = this.dateString;
      this.el.querySelector('.posts-layer__detector').dataset.page = this.page;
      this.el.dataset.date = this.dateString;
      this.el.dataset.page = this.page;

      this._postWidgets = [];
      this._indicatorWidgets = [];

      this.waterfall = new Waterfall({
        containerElement : this.postsContainer,
        positioning : 'xy'
      });
    },

    addPosts : function addPosts (posts, viewType) {
      var fragment = document.createDocumentFragment();

      posts.forEach(function (post, index) {
        post.name = 'post_' + index;
        post.className = viewType + '-view';
        this.appendChild(CV.Post.create(post))
          .loadImage()
          .render(fragment);

        this._postWidgets.push(this['post_' + index]);
      }, this);

      if (viewType === 'cards') {
        this.waterfall.addItems([].slice.call(fragment.childNodes, 0));
      } else if (viewType === 'list') {
        this.postsContainer.style.height = '';
      }
      this.postsContainer.appendChild(fragment);

      if (viewType === 'cards') { this.waterfall.layout(); }
      else if (viewType === 'list') {
        this.postsContainer.style.height = this.postsContainer.offsetHeight + 'px';
      }

      this._finalHeightIsKnow = true;
      this._addPostsIndicators(this._postWidgets);

      return this;
    },

    getPosts : function getPosts() {
      return this._postWidgets;
    },

    filterPosts : function filterPosts (sourceTypes, viewType) {
      var showAll = false;

      if (!sourceTypes) {
        showAll = true;
      }

      function showAllFn(post) {
        post.el.style.display = 'block';
      }

      function filterFn(post) {
        if (sourceTypes.indexOf(post.sourceType) < 0) {
          post.el.style.display = 'none';
        } else {
          post.el.style.display = 'block';
        }
      }

      if (showAll) {
        this._postWidgets.forEach(showAllFn);
      } else {
        this._postWidgets.forEach(filterFn);
      }

      if (viewType === 'cards') { this.waterfall.layout(); }
      else if (viewType === 'list') {
        this.postsContainer.style.height = '';
        this.postsContainer.style.height = this.postsContainer.offsetHeight + 'px';
      }

      this._updatePostIndicatorsPosition();
    },

    /* Sets the heigth of the layer. If a number is provided it will convert it into pixel units.
     * @method setHeight <public> [Function]
     * @param height <required> [Number or String]
     */
    setHeight : function setHeight(height) {
      if (typeof height === 'number') {
        height = height + 'px';
      }

      this.postsContainer.style.height = height;
      this._finalHeightIsKnow = false;
    },

    reLayout : function reLayout(args) {
      if (this.waterfall.getItems().length) { this.waterfall.layout(); }
      if (!this.getPosts().length) { this.setHeight(args.averageHeigth); }
      this._updatePostIndicatorsPosition();
      return this;
    },

    /* Destroy all its children.
     * @return undefined
     */
    empty : function empty() {
      while (this.children.length > 0) {
        this.children[0].destroy();
      }
      this.waterfall.flushItems();
      this._postWidgets = [];
      this._indicatorWidgets = [];
      return this;
    },

    /* Create, append and render the posts dates indicators shown on the far right of the screen.
     * @private
     * This function is invoked by the `addPosts` public method.
     * @param {Object} posts - Post instances references.
     */
    _addPostsIndicators : function _addPostsIndicators (posts) {
      var frag = document.createDocumentFragment();

      for (var i = 0, len = posts.length; i < len; i++) {
        this.appendChild(new CV.EmbedLayerPostIndicator({
          name : 'indicator_' + i,
          label : posts[i].el.dataset.date,
          refElement : posts[i].el,
          zIndex : (len - i)
        })).activate().render(frag);

        this._indicatorWidgets.push(this['indicator_' + i]);
      }

      this._updatePostIndicatorsPosition();
      this.ticksContainerElement.appendChild(frag);
    },

    /* Updates the position of each indicator.
     * @private
     */
    _updatePostIndicatorsPosition : function _updatePostIndicatorsPosition() {
      CV.EmbedLayerPostIndicator.flushRegisteredYValues();

      for (var i = 0, len = this._indicatorWidgets.length; i < len; i++) {
        this._indicatorWidgets[i].updatePosition();
      }
    }
  }
});
