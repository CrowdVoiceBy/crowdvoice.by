/* globals App */
var rome = require('rome');
var moment = require('moment');
var autosize = require('autosize');
var API = require('./../../../lib/api');
var Events = require('./../../../lib/events');

Class(CV, 'EditablePost').includes(CV.WidgetUtils, CustomEventSupport, NodeSupport, BubblingSupport)({
    MAX_LENGTH_TITLE : 65,
    MAX_LENGTH_DESCRIPTION : 180,
    MAX_IMAGE_WIDTH : 300,

    HTML_DATE_PICKER : '\
        <div class="post-edit-date-picker -inline-block">\
            <button class="post-date-picker-button cv-button primary micro -m0 -float-right">\
                <svg class="post-edit-date-picker-calendar -color-white">\
                    <use xlink:href="#svg-calendar"></use>\
                <svg>\
            </button>\
            <div class="-overflow-hidden">\
                <input class="cv-input micro"/>\
            </div>\
        </div>',

    HTML_ADD_COVER_BUTTON : '<button class="post-edit-add-cover-button cv-button tiny">Add Cover</button>',
    HTML_UPLOAD_COVER_BUTTON : '<button class="post-edit-upload-cover-button cv-button tiny">Upload Cover</button>',

    /* Creates a specific Post by type using the Strategy Pattern.
     * The Post type should be one of the knows post types available.
     * @method create <public, static> [Function]
     * @arguments config <required> [Object] The Post Model Data.
     * @return new CV.Post[type]
     */
    create : function create(config) {
        var type = this.prototype.format.capitalizeFirstLetter(config.sourceType);

        return new window.CV['EditablePost' + type](config);
    },

    prototype : {
        sourceType: '',
        sourceUrl: '',
        sourceService: '',
        title: '',
        description: '',
        image: '',
        imageWidth: 0,
        imageHeight: 0,
        publishedAt: '',

        /* preview post creation props */
        images : null,
        imagesToBeRemove : null,
        imagePath : '',

        /* private props */
        _currentImageIndex : 0,
        _imagesLen : 0,
        _DO_NOT_DISPLAY_COVER_IMAGE : false,

        /* Checks if we receive an Array of images on the initial config object,
         * if so it means that we may have to show the controls to allow the user selecting a cover image
         * @method setup <protected> [Function]
         * @return EditablePost
         */
        setup : function setup() {
            var parent = this.el.parentNode;
            var wrapper = document.createElement('div');
            var position = 0;
            for (var i = 0; i < parent.childNodes.length; i++) {
                if (parent.childNodes[i] === this.el) {
                    position = i;
                    break;
                }
            }
            wrapper.className = 'post-editable -rel';
            Object.keys(this.el.dataset).forEach(function(attr) {
                wrapper.dataset[attr] = this.el.dataset[attr];
            }, this);
            wrapper.appendChild(this.el);
            parent.insertBefore(wrapper, parent.childNodes[position]);
            this.el = wrapper;

            return this;
        },

        /* Returns the new modified data of Post.
         * @method getEditedData <pubic> [Function]
         * @returns PostModel data + imagesArray extra props [Object]
         */
        getEditedData : function getEditedData() {
            var imagePath = '';

            if (this.postImages) {
                // Editing an existing Post? (moderation)
                if (this._DO_NOT_DISPLAY_COVER_IMAGE === true) {
                    // post without image
                    imagePath = this.imagePath;
                } else {
                    // post with current image (if replaced), otherwise
                    // post with old image
                    imagePath = this.imagePath || this.postImages && this.postImages.medium && this.postImages.medium.url || '';
                }
            } else {
                // Editing a very new post.
                imagePath = this.imagePath;
            }

            return {
                title : this.format.truncate(this.titleElement.value, this.constructor.MAX_LENGTH_TITLE),
                description : this.format.truncate(this.descriptionElement.value, this.constructor.MAX_LENGTH_DESCRIPTION) || ' ',
                publishedAt : this.romeTime.getDate(),

                image : this.image,
                imageWidth : this.imageWidth,
                imageHeight : this.imageHeight,

                sourceType : this.sourceType,
                sourceService : this.sourceService,
                sourceUrl : this.sourceUrl,

                // extra props
                images : this.imagesToBeRemove.map(function(item) {return item.path;}),
                imagePath : imagePath,
            };
        },

        /* Display the ImageControls to remove/replace the Post Image.
         * @method addImageControls <public> [Function]
         * @return EditablePost
         */
        addImageControls : function addImageControls() {
            if (this.images) {
                this._imagesLen = this.images.length;
                this.imagesToBeRemove = this.images.slice();
            } else {
                // create empty array so it does not break, postPresenter
                // expects this.images.toBe(Array)
                this.images = [];
                this.imagesToBeRemove = [];
            }

            if (this._imagesLen) {
                // it is a very new Post and has 1 or more images
                this._currentImageIndex = 0;
                this._updatePostImage()._addImageControls();
            } else {
                if (this.postImages && this.postImages.medium) {
                    // it is an existing Post (moderation)
                    // add the existing image to the array so it allows the
                    // user to replace the image if she want.
                    this.images.push({
                        format: this.postImages.medium.meta.format,
                        height: this.postImages.medium.meta.height,
                        width: this.postImages.medium.meta.width,
                        path: this.postImages.medium.url
                    });

                    this._currentImageIndex = 0;
                } else {
                    // it is a very new Post with no images.
                    // display the upload button so the user can upload.
                    // an image from its current device.
                    this._showUploadCoverButton();
                }

                this._addImageControls();
            }

            return this;
        },

        /* Changes the title and description HTMLElements into TextAreas.
         * If it has postData.images then it shows the replace and remove buttons
         * If it has more than 1 postData.images then it shows the next/prev buttons for switching images.
         * @method _makeItEditable <private> [Function]
         * @return EditablePost
         */
        edit : function edit() {
            this.el.classList.add('edit-mode');
            this.titleElement.classList.add('-font-bold');

            // replace current tags for a textarea
            this.titleElement.outerHTML = this.titleElement.outerHTML.replace(/<h2/, '<textarea').replace(/<\/h2>/, '</textarea>');
            this.descriptionElement.outerHTML = this.descriptionElement.outerHTML.replace(/<p/, '<textarea').replace(/<\/p>/, '</textarea>');

            // update pointers to new textareas
            this.titleElement = this.el.querySelector('.post-card-title');
            this.descriptionElement = this.el.querySelector('.post-card-description');

            // clean spaces and line breaks
            this.titleElement.textContent = this.titleElement.textContent.replace(/\r?\n/ig, '').replace(/\t/gm, '').replace(/\s/gm,' ');
            this.descriptionElement.textContent = this.descriptionElement.textContent.replace(/\r?\n/ig, '').replace(/\t/gm, '').replace(/\s/gm,' ');

            // set the max length
            this.titleElement.setAttribute('maxlength', this.constructor.MAX_LENGTH_TITLE);
            this.descriptionElement.setAttribute('maxlength', this.constructor.MAX_LENGTH_DESCRIPTION);

            // add letters counter based on maxlengths
            this.appendChild(new CV.InputCounter({
                name : 'titleCounter',
                inputReference : this.titleElement,
                maxLength : this.constructor.MAX_LENGTH_TITLE,
                className : '-block'
            })).render(this.el, this.descriptionElement);

            this.appendChild(new CV.InputCounter({
                name : 'descriptionCounter',
                inputReference : this.descriptionElement,
                maxLength : this.constructor.MAX_LENGTH_DESCRIPTION,
                className : '-block'
            })).render(this.el.querySelector('.post-card-info'));

            // add the date picker
            this.dateTimeElement.style.display = 'none';
            this.dateTimeElement.parentNode.insertAdjacentHTML('beforeend', this.constructor.HTML_DATE_PICKER);
            this.timePickerInput = this.dateTimeElement.parentNode.querySelector('.cv-input');
            this.timePickerButton = this.dateTimeElement.parentNode.querySelector('.post-date-picker-button');

            this.romeTime = rome(this.timePickerInput, {
                inputFormat : 'DD MMM, YYYY HH:mm',
                initialValue : moment(this.publishedAt || new Date())
            });

            this._bindEditEvents();

            return this;
        },

        /* Remove event listeners added when the edit method was run.
         * @method unedit <public> [Function]
         * @return EditablePost
         */
        unedit : function unedit() {
            this.titleElement.removeEventListener('autosize:resized', this._postDimensionsChangedRef);
            this.descriptionElement.removeEventListener('autosize:resized', this._postDimensionsChangedRef);
            this._postDimensionsChangedRef = null;

            autosize.destroy(this.titleElement);
            autosize.destroy(this.descriptionElement);

            Events.off(this.timePickerButton, 'click', this._showDatePickerRef);
            Events.off(this.romeTime.associated, 'click', this._showDatePickerRef);
            this._showDatePickerRef = null;

            Events.off(this.titleElement, 'keypress', this._titleKeyPressHandler);

            this.romeTime.destroy();

            return this;
         },

        /* Adds the `post-unmoderated` class name selector to Post main element.
         * This class applies visual changes only.
         * @method unmoderatedStyle <public> [Function]
         * @return EditablePost
         */
        unmoderatedStyle : function unmoderatedStyle() {
            this.el.classList.add('post-unmoderated');
            return this;
        },

        /* Adds the delete post button (for moderation management)
         * @method addRemoveButton <public> [Function]
         * @return EditablePost
         */
        addRemoveButton : function addRemoveButton() {
            this.appendChild(new CV.PostModerateRemoveButton({
                name : 'removeButton',
                postId : this.id,
                className : '-m0'
            }));
            this.el.appendChild(this.removeButton.el);
            return this;
        },

        addButtonRow : function addButtonRow(){
            this.buttonRow = document.createElement('div');
            this.el.classList.add('has-bottom-actions');
            this.el.appendChild(this.buttonRow);

             if(this.sourceType !== 'text' && this.sourceType !== 'image'){
                this.buttonRow.setAttribute('class', 'post-moderate-button-row');
                this.addPublishButton();
                this.addViewOriginalButton(this.sourceUrl);
            } else if(this.sourceType === 'text'){
                this.buttonRow.setAttribute('class', 'post-moderate-button-row');
                this.addPublishButton();
                this.addEditArticleButton();
            }else{
                this.addPublishButton();
            }
            return this;
        },
        /* Adds the publish post button (for moderation management)
         * @method addPublishButton <public> [Function]
         * @return EditablePost
         */
        addPublishButton : function addPublishButton() {
            this.appendChild(new CV.PostModeratePublishButton({
                name : 'publishButton',
                postId : this.id,
                className : '-m0'
            })).render(this.buttonRow);

            return this;
        },

        addViewOriginalButton : function addViewOriginalButton(url) {
            this.appendChild(new CV.PostModerateOriginalButton({
                name: 'viewOriginal',
                originalUrl : url,
            })).render(this.buttonRow);

            return this;
        },

        addEditArticleButton : function addEditArticleButton() {
            this.appendChild(new CV.PostModerateEditButton({
                name: 'editArticle',
                data : {
                    title: this.title,
                    description: this.description,
                    publishedAt: this.romeTime,
                    imagePath : this.images,
                    postId: this.id,
                    profileName : App.Voice.data.owner.profileName,
                    voiceSlug : App.Voice.data.slug
                }
            })).render(this.buttonRow);

            return this;
        },

        /* Adds the vote up/down buttons (for moderation management)
         * @method addVoteButtons <public> [Function]
         * @return EditablePost
         */
        addVoteButtons : function addVoteButtons() {
            this.appendChild(new CV.PostModerateVoteButtons({
                name : 'voteButtons',
                post : this
            }));
            this.el.appendChild(this.voteButtons.el);
            this.el.classList.add('has-bottom-actions');
            return this;
        },

        /* Binds the required events when the edit method is run
         * @method private _bindEditEvents <private> [Function]
         * @return EditablePost
         */
        _bindEditEvents : function _bindEditEvents() {
            autosize(this.titleElement);
            autosize(this.descriptionElement);

            this._postDimensionsChangedRef = this._postDimensionsChanged.bind(this);
            this.titleElement.addEventListener('autosize:resized', this._postDimensionsChangedRef);
            this.descriptionElement.addEventListener('autosize:resized', this._postDimensionsChangedRef);

            this._showDatePickerRef = this._showDatePicker.bind(this);
            Events.on(this.timePickerButton, 'click', this._showDatePickerRef);
            Events.on(this.romeTime.associated, 'click', this._showDatePickerRef);

            Events.on(this.titleElement, 'keypress', this._titleKeyPressHandler);

            return this;
        },

        /* Dispatch that the post has changed its dimensions. Usefull for parents to re-position Posts.
         * @method _postDimensionsChanged <private> [Function]
         * @return undefined
         */
        _postDimensionsChanged : function _postDimensionsChanged() {
            this.dispatch('dimensionsChanged', {layer: this.parent});
        },

        /* Updates the selected post image, the post imageContainer height and display the image cover
         * @method _updatePostImage <private> [Function]
         * @return EditablePost
         */
        _updatePostImage : function _updatePostImage() {
            var current = this.images[this._currentImageIndex];
            var height = this.imageHeight;

            this.imagePath = current.path;
            this.imageWidth = current.width;
            this.imageHeight = current.height;

            if (this.imageWidth > this.constructor.MAX_IMAGE_WIDTH) {
                height = this.imageHeight / this.imageWidth * this.constructor.MAX_IMAGE_WIDTH;
            }

            this.setImageHeight(height);
            this.setCoverImage(this.imagePath);

            this._postDimensionsChanged();
            return this;
        },

        /* Reset dynamic post image so the response to save indicates the the user choose to not display any image
         * @method _resetPostImage <private> [Function]
         * @return undefined
         */
        _resetPostImage : function _resetPostImage() {
            this.imagePath = '';
            this.imageWidth = null;
            this.imageHeight = null;
            this._DO_NOT_DISPLAY_COVER_IMAGE = true;
        },

        /* Shows the Upload Cover Button.
         * This button is displayed only when the Posts has 0 images.
         * The button allows the user to choose an image from its device to be
         * displayed as the cover image of the Post.
         * @method _showUploadCoverButton <private> [Function]
         * @return EditablePost
         */
        _showUploadCoverButton : function _showUploadCoverButton() {
            this.el.insertAdjacentHTML('afterbegin', this.constructor.HTML_UPLOAD_COVER_BUTTON);
            this.uploadCoverButton = this.el.querySelector('.post-edit-upload-cover-button');
            this.uploadCoverButton.classList.add('active');
            this._triggerUploadImageRef = this._triggerUploadImage.bind(this);
            this.uploadCoverButton.addEventListener('click', this._triggerUploadImageRef);
            return this;
        },

        /* Open the 'select file' window.
         * This will trigger the click event on imageControls.replaceButton, so the flow
         * for replace and upload is the same thing.
         * @method _triggerUploadImage <private> [Function]
         */
        _triggerUploadImage : function _triggerUploadImage(ev) {
            ev.stopPropagation();
            this.imageControls.replaceButton.click();
        },

        /* Adds the image controls (next,prev,remove,add) to handle the cover and subscribe its events.
         * @method _addImageControls <protected> [Function]
         * @return EditablePost
         */
        _addImageControls : function _addImageControls() {
            this.appendChild(new CV.PostEditImageControls({
                name : 'imageControls',
                images : this.images,
                sourceType : this.sourceType
            })).render(this.imageWrapperElement);

            this._prevImageRef = this._prevImage.bind(this);
            this.imageControls.bind('prevImage', this._prevImageRef);

            this._nextImageRef = this._nextImage.bind(this);
            this.imageControls.bind('nextImage', this._nextImageRef);

            this._removeImageRef = this._removeImage.bind(this);
            this.imageControls.bind('removeImage', this._removeImageRef);

            this._replaceImageRef = this._replaceImage.bind(this);
            this.imageControls.bind('replaceImage', this._replaceImageRef);

            this.el.insertAdjacentHTML('afterbegin', this.constructor.HTML_ADD_COVER_BUTTON);
            this._showImageRef = this._showImage.bind(this);
            this.addCoverButton = this.el.querySelector('.post-edit-add-cover-button');
            this.addCoverButton.addEventListener('click', this._showImageRef);

            return this;
        },

        /* Updates the _currentImageIndex and run _updatePostImage.
         * @method _nextImage <private> [Function]
         * @return undefined
         */
        _nextImage : function _nextImage() {
            if (this._currentImageIndex < (this._imagesLen - 1)) {
                this._currentImageIndex++;
            } else {
                this._currentImageIndex = 0;
            }

            this._updatePostImage();
        },

        /* Updates the _currentImageIndex and run _updatePostImage.
         * @method _prevImage <private> [Function]
         * @return undefined
         */
        _prevImage : function _prevImage() {
            if (this._currentImageIndex > 0) {
                this._currentImageIndex--;
            } else {
                this._currentImageIndex = (this._imagesLen - 1);
            }

            this._updatePostImage();
        },

        /* Hides the post.imageContainer, clears the image data and shows addCoverButton.
         * @method _removeImage <private> [Function]
         * @return undefined
         */
        _removeImage : function _removeImage() {
            this.hideImageWrapper();
            this._resetPostImage();
            this.addCoverButton.classList.add('active');
            this._postDimensionsChanged();
        },

        /* Uploads a new image.
         * @argument ev <required> [Object]
         * @argument ev.image <required> [File] the image to be uploaded.
         * Should be a File, useually taken from an input file.
         * @return undefined
         */
        _replaceImage : function _replaceImage(ev) {
            var data = new FormData(); data.append('image',  ev.image);

            API.uploadArticleImage({
                profileName : App.Voice.data.owner.profileName,
                voiceSlug : App.Voice.data.slug,
                data : data,
            }, function(err, res) {
                this.images.push(res);
                this.imagesToBeRemove.push(res);
                this._imagesLen = this.images.length;
                this._currentImageIndex = (this._imagesLen - 1);
                this._updatePostImage();

                if (this.uploadCoverButton) {
                    this.uploadCoverButton.classList.remove('active');
                }

                if (this.imageControls) {
                    this.imageControls.updateImages(this.images);
                } else {
                    this._addImageControls();
                }
            }.bind(this));
        },

        /* Shows the post.imageContainer, updates the image data to be send and hides addCoverButton
         * @method _showImage <private> [Function]
         * @return undefined
         */
        _showImage : function _showImage() {
            this._updatePostImage();
            this.addCoverButton.classList.remove('active');
        },

        /* Prevent the user hiting ENTER
         * @method _titleKeyPressHandler <private> [Function]
         */
        _titleKeyPressHandler : function _titleKeyPressHandler(ev) {
            var charCode = (typeof ev.which === 'number') ? ev.which : ev.keyCode;
            if (charCode === 13) {
                ev.preventDefault();
            }
        },

        _showDatePicker : function _showDatePicker(ev) {
            ev.stopPropagation();
            this.romeTime.show();
            this.romeTime.container.style.zIndex = 3;
        }
    }
});
