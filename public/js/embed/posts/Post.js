/* Class CV.Post Factory and Base Class.
 * Creates a new Post Widget of the type passed on the params.
 * @usage CV.Post.create({type: 'someKnownPostType', ...}).render(...);
 * @return new CV.Post[type]
 */
Class(CV, 'Post').inherits(Widget).includes(
  CV.WidgetUtils,
  CV.PostModuleImages,
  BubblingSupport
)({
  FAVICON : '<img class="post-card-meta-icon-image" src="{src}"/>',

  /* Creates a specific Post by type using the Factory Pattern.
   * The Post type should be one of the knows post types available.
   * @public|static
   * @param {Object} config - The Post Model Data.
   * @return {Object} new CV.Post[type]
   */
  create : function create (config) {
    var type = this.prototype.format.capitalizeFirstLetter(config.sourceType);
    return new window.CV['Post' + type](config);
  }
});