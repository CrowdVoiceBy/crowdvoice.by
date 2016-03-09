Class(CV, 'FeedMessage').inherits(CV.FeedItem)({
  ELEMENT_CLASS: 'cv-feed-item message',

  prototype: {
    /* FeedPresenter Result.
     * @property <required> [Object]
     */
    data: null,

    init: function init(config) {
      CV.FeedItem.prototype.init.call(this, config);

      this.updateAvatar();

      if (this.data.text) {
        this.setText(this.data.text);
      }
    }
  }
});

