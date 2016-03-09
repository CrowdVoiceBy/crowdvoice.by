var moment = require('moment');
var Person = require('./../lib/currentPerson');

Class(CV.Views, 'PostShow').includes(CV.WidgetUtils, NodeSupport)({
  FAVICON : '<img class="post-show__meta-icon-image" src="{src}"/>',

  /* Template to display readability’s content error.
   * @private|static
   */
  ERROR_LOADING_READABLE_CONTENTS : '\
    <h2>Sorry, we couldn’t load the content.</h2>\
    <div class="-inline-block -mt1">\
      <a class="cv-button large -font-bold" href="{src}" target="_blank">View Original Source</a>\
    </div>',

  prototype: {
    /* @param {Object} config - the widget configuration settings.
     * @property {Object} config.post - the Post Model.
     * @property {Object} config.readablePost - the readablePost data.
     */
    init: function init(config) {
      Object.keys(config || {}).forEach(function (propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      this.descriptionElement = this.el.querySelector('.post-show__description');
      this.sourceElement = this.el.querySelector('.post-show__meta-source');
      this.dateTimeElement = this.el.querySelector('.post-show__meta > time');
      this.savedElement = this.el.querySelector('[data-saved]');
      this.viewOriginalBtn = this.el.querySelector('.actions-view-original-btn');
      this.actionsGroup = this.el.querySelector('.post-show__actions .multiple');

      this._setup();
    },

    /* Instantiate the widget children and updates the main ui contents.
     * @private
     */
    _setup : function _setup() {
      if (this.readablePost) {
        if (this.readablePost.data && this.readablePost.data.content) {
          this.dom.updateHTML(this.descriptionElement, this.readablePost.data.content);
        } else {
          var errorLoadingContent = this.constructor.ERROR_LOADING_READABLE_CONTENTS;
          errorLoadingContent = errorLoadingContent.replace(/{src}/, this.post.sourceUrl);
          this.dom.updateHTML(this.descriptionElement, errorLoadingContent);
          this.descriptionElement.style.textAlign = 'center';
          errorLoadingContent = null;
        }
      } else {
        this.dom.updateHTML(this.descriptionElement, this.post.description);
      }

      if (this.post.faviconPath) {
        this.sourceElement.insertAdjacentHTML('afterbegin', this.constructor.FAVICON.replace(/{src}/, this.post.faviconPath));
        this.sourceElement.insertAdjacentHTML('beforeend', '<a href="' + this.post.sourceDomain + '" target="_blank">'+ this.post.sourceDomain.replace(/.*?:\/\/(w{3}.)?/g, "") + '</a> ');
      } else {
        this.sourceElement.parentNode.removeChild(this.sourceElement);
      }

      this.dom.updateText(this.dateTimeElement, moment(this.post.publishedAt).format('MMM DD, YYYY'));
      this.dom.updateAttr('datetime', this.dateTimeElement, this.post.publishedAt);

      if (Person.get() && (!Person.anon())) {
        this.appendChild(new CV.PostDetailActionsSave({
          name : 'actionSave'
        })).render(this.actionsGroup).update(this.post);
      }

      this.appendChild(new CV.PostDetailActionsShare({
        name : 'actionShare',
        tooltipPostition : 'bottom'
      })).render(this.actionsGroup).update(this.post);

      if (this.post.sourceType === 'text') {
        this.dom.addClass(this.viewOriginalBtn, ['-hide']);
      } else {
        this.dom.removeClass(this.viewOriginalBtn, ['-hide']);
        this.dom.updateAttr('href', this.viewOriginalBtn, this.post.sourceUrl);

        var readMoreButton = '\
          <div class="-block -mt1 -text-center">\
            <a class="cv-button large -font-bold" href="{src}" target="_blank">Read More</a>\
          </div>'.replace(/{src}/, this.post.sourceUrl);
        this.descriptionElement.insertAdjacentHTML('beforeend', readMoreButton);
      }

      this.updateSaves(this.post);

      return this;
    },

    /* Updates the saved posts counter.
     * @public
     */
    updateSaves : function updateSaves(data) {
      this.dom.updateText(this.savedElement, data.totalSaves || 0);
      return this;
    },
  }
});
