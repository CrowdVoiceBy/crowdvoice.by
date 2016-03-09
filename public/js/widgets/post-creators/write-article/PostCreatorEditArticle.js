/* globals App */
var key = require('keymaster')
  , API = require('./../../../lib/api');

Class(CV, 'PostCreatorEditArticle').inherits(CV.PostCreator).includes(BubblingSupport)({
  ELEMENT_CLASS : 'cv-post-creator post-creator-write-article',

  HTML : '\
    <div>\
      <header class="cv-post-creator__header -clearfix"></header>\
      <div class="cv-post-creator__content -abs"></div>\
      <div class="cv-post-creator__disable article"></div>\
    </div>',

  prototype : {

    el : null,
    header : null,
    content : null,
    articleImage : null,
    voiceData : null,

    init : function init(config) {
      CV.PostCreator.prototype.init.call(this, config);

      this.el = this.element[0];
      this.header = this.el.querySelector('.cv-post-creator__header');
      this.content = this.el.querySelector('.cv-post-creator__content');
      this.loadingStep = $(this.el.querySelector('.cv-post-creator__disable'));

      this.addCloseButton()._setup()._bindEvents()._enabledPostButton();
    },

    _setup : function _setup() {
      this.appendChild(new CV.Loading({
        name : 'loader'
      })).render(this.el.querySelector('.cv-post-creator__disable')).center();

      this.appendChild(new CV.PostCreatorSuccessTemplate({
        name : 'loaderSuccess'
      })).render(this.el.querySelector('.cv-post-creator__disable'));

      this.appendChild(new CV.PostCreatorErrorTemplate({
        name : 'loaderError'
      })).render(this.el.querySelector('.cv-post-creator__disable'));

      this.appendChild(new CV.PostCreatorEditButton({
        name : 'postButton',
        className : '-rel -float-right -full-height -color-border-grey-light'
      })).render(this.header);

      this.appendChild(new CV.PostCreatorWriteArticlePostDate({
        name : 'postDate',
        className : '-overflow-hidden -full-height'
      })).render(this.header);

      this.appendChild(new CV.PostCreatorWriteArticleEditor({
        name : 'editor'
      })).render(this.content);

      // Content
      this.articleContent = $(this.content.querySelector('.write-article-body-editable'));
      this.articleTitle = $(this.content.querySelector('.editor-title'));

      // Image placeholder, error feedback placeholder &  button
      this.coverImage = $(this.editor.editorHeader.el);

      this.errorFeedback = $(this.postDate.errorFeedback);
      this.coverButton = this.editor.editorHeader.coverButton;

      return this;
    },

    editStartingValues : function editStartingValues() {
      // Voice Content Data
      this.voiceTitle = this.data.voiceData.title;
      this.voiceContent = this.data.voiceData.description;
      this.voicePublishedDate = this.data.voiceData.publishedAt;
      this.postDate.timePickerInput.value = this.voicePublishedDate.associated.value;

      // Voice Content Modification
      this.postDate.el.querySelector('.write-article-title').innerText = 'Edit Article';
      this.articleContent.html(this.voiceContent);
      this.articleContent.removeClass('medium-editor-placeholder');
      this.articleTitle[0].value = this.voiceTitle;

      if( this.data.voiceData.imagePath[0] ){
        this.articleImage = this.data.voiceData.imagePath[0].path;
        this.articleTitle.addClass('editor-title-bg');
        this.coverImage.addClass('-img-cover');
        this.coverImage.css('background-image', 'url(' + this.articleImage + ')');
        this.editor.el.querySelector('.editor-add-cover').innerText = 'Replace';
      }

      return this;
    },

    /* Subscribe the widget’s events.
     * @private
     * @return [PostCreatorFromUrl]
     */
    _bindEvents: function _bindEvents() {
      this._preventESCKeyRef =  this._preventESCKey.bind(this);
      key('esc', 'EditArticleModal', this._preventESCKeyRef);
      key.setScope('EditArticleModal');

      this._buttonClickRef = this._buttonClick.bind(this);
      this.postButton.bind('editButtonClick', this._buttonClickRef);

      this._imageReceivedRef = this._imageReceived.bind(this);
      this.coverButton.bind('fileUploaded', this._imageReceivedRef);

      this._contentFilledRef = this._contentFilled.bind(this);
      this.articleTitle.on('change keyup paste',this._contentFilledRef);
      this.articleContent.on('change keyup paste',this._contentFilledRef);

      return this;
    },

    /* Prevent and stop propagation if the ESC key is pressed.
     * @private
     */
    _preventESCKey: function _preventESCKey() {
      return false;
    },

    /* Add the data from the DOM
     * And sents it to voiceNewArticle
     * API Endpoint
     */
    _buttonClick : function _buttonClick(){
      this._disablePostButton();
      this.loadingStep.addClass('active');

      if(this.articleImage !== null){
        API.postUpdate({
          profileName : this.data.voiceData.profileName,
          voiceSlug : this.data.voiceData.voiceSlug,
          postId : this.data.voiceData.postId,
          data : {
            title : this.articleTitle.val(),
            description : this.articleContent.html(),
            imagePath : this.articleImage,
            publishedAt : this.postDate.timePickerInput.value
          }
        }, this._responseHandler.bind(this));
      }else{
        API.postUpdate({
          profileName : this.data.voiceData.profileName,
          voiceSlug : this.data.voiceData.voiceSlug,
          postId : this.data.voiceData.postId,
          data : {
            title : this.articleTitle.val(),
            description : this.articleContent.html(),
            imagePath : '',
            publishedAt : this.postDate.timePickerInput.value
          }
        }, this._responseHandler.bind(this));
      }
    },

    _responseHandler : function _responseHandler(err, res){
      if (err) {
        this.loaderError.activate();
        this._enabledPostButton();

        this.loader.disable();
        this.loaderError.activate();
        this.errorFeedback.text('An error has occurred: ' + res.status + ' ' + res.statusText);
        this.el.classList.add('has-error');

        window.setTimeout(function() {
          this.loadingStep.removeClass('active');
        }.bind(this), 2000);

        return;
      }
      // Success feedack
      this.loader.disable();
      this.loaderSuccess.activate();
      window.setTimeout(function() {
        this.loaderSuccess.deactivate();
        this.dispatch('articleEdited');
      }.bind(this), 2000);
    },

    // Gets the <INPUT> IMAGE and sent it to the API
    _imageReceived : function _imageReceived(ev){
      var imageData = new FormData();
      imageData.append('image', ev.data);

      API.uploadArticleImage({
        profileName : App.Voice.data.owner.profileName,
        voiceSlug : App.Voice.data.slug,
        data : imageData
      }, function (err, res){
        if (err) {
          console.log(res.status + ' ' + res.statusText);
          this.errorFeedback.text('An error has occurred while uploading your image: ' + res.status + ' ' + res.statusText);
          this.el.classList.add('has-error');
          return;
        }
        this._imageUploaded(res);
      }.bind(this));
    },

    //Gets the API response and applies the header background
    _imageUploaded : function _imageUploaded(image){
      this.articleImage = image.path;
      this.articleTitle.addClass('editor-title-bg');
      this.coverImage.addClass('-img-cover');
      this.coverImage.css('background-image', 'url(' + this.articleImage + ')');
    },

    _contentFilled : function _contentFilled(){
      var editorObject = this.editor.editorBody.editor.serialize();
      var editorContent = $(editorObject["element-0"].value);

      if( editorContent.text().length > 0 && this.articleTitle.val().length ){
        this._enabledPostButton();
      }else{
        this._disablePostButton();
      }
    },

    /* Enables the Post Button.
     * @method _enabledPostButton <private> [Function]
     * @return [PostCreatorFromUrl]
     */
    _enabledPostButton : function _enabledPostButton() {
      this.postButton.enable();
      return this;
    },

    /* Disables the Post Button.
     * @method _disablePostButton <private> [Function]
     * @return [PostCreatorFromUrl]
     */
    _disablePostButton : function _disablePostButton() {
      this.postButton.disable();
      return this;
    },

    destroy: function destroy() {
      CV.PostCreator.prototype.destroy.call(this);
      key.unbind('esc', 'EditArticleModal');
      this._preventESCKeyRef =  null;

      this.articleTitle.off('change keyup paste',this._contentFilledRef);
      this.articleContent.off('change keyup paste',this._contentFilledRef);
      this._contentFilledRef = null;
    }
  }
});
