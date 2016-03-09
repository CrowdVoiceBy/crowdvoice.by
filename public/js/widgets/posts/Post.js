/* Class CV.Post Main Class.
 * Creates a new Post Widget of the type passed on the params.
 * @usage CV.Post.create({type: 'someKnownPostType', ...}).render(...);
 * @return new CV.Post[type]
 */
Class(CV, 'Post').inherits(Widget).includes(
    CV.WidgetUtils,
    CV.PostModuleImages,
    BubblingSupport
)({
  ACTIONS_HTML: '\
    <div class="post-card-actions">\
      <div class="-row -full-height" data-actions-row></div>\
    </div>',

  FAVICON: '<img class="post-card-meta-icon-image" src="{src}"/>',

  /* Creates a specific Post by type using the Strategy Pattern.
   * The Post type should be one of the knows post types available.
   * @public, static
   * @param {Object} config - The Post Model Data.
   * @return new CV.Post[type]
   */
  create: function create(config) {
    var type = this.prototype.format.capitalizeFirstLetter(config.sourceType);
    return new window.CV['Post' + type](config);
  },

  prototype: {
    /* PUBLIC config */
    sourceType: '',
    sourceUrl: '',
    sourceService: '',
    title: '',
    description: '',
    image: '',
    imageMeta : null,
    totalReposts: 0,
    totalSaves: 0,
    publishedAt: '',

    /* Adds the Re-post, save and share buttons
     * @public
     */
    addActions: function addActions() {
      var postElement = this.el;

      if (postElement.classList.contains('post-card') === false) {
        postElement = postElement.querySelector('.post-card');
      }

      postElement.insertAdjacentHTML('beforeend', this.constructor.ACTIONS_HTML);
      this.actionsRow = this.el.querySelector('[data-actions-row]');

      this.appendChild(new CV.PostActionSave({
        name: 'actionSave',
        className: '-col-6',
        entity: this
      })).render(this.actionsRow);

      this.appendChild(new CV.PostActionShare({
        name: 'actionShare',
        className: '-col-6',
        entity: this
      })).render(this.actionsRow);

      return this;
    },

    /* Updates the Saved number for the current Post.
     * Usefull to live-show the update for the user and reflect its change
     * has taken place.
     * @method updateSaves <protected> [Function]
     * @param {Object} data - The Post Model Data.
     * @return CV.Post[type]
     */
    updateSaves: function updateSaves(data) {
      this.dom.updateText(this.savedElement, data.totalSaves || '');
      return this;
    },

    addIsHoverState: function addIsHoverState() {
      this.dom.addClass(this.el, ['-is-hover']);
      return this;
    },

    removeIsHoverState: function removeIsHoverState() {
      this.dom.removeClass(this.el, ['-is-hover']);
      return this;
    },

    destroy: function destroy() {
      Widget.prototype.destroy.call(this);

      this.sourceType = null;
      this.sourceUrl = null;
      this.sourceService = null;
      this.title = null;
      this.description = null;
      this.image = null;
      this.imageMeta = null;
      this.totalReposts = null;
      this.totalSaves = null;
      this.publishedAt = null;

      /* module image */
      this.imageLoaded = null;
      this.haltImage = null;

      /* destroy current post type */
      this.__destroy();
    }
  }
});

