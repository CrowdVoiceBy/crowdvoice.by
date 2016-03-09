/* globals App */
var API = require('../../../lib/api');
var Events = require('../../../lib/events');

Class(CV, 'PostCreatorUploadFile').inherits(CV.PostCreator)({
    ELEMENT_CLASS : 'cv-post-creator post-creator-upload-file',
    HTML : '\
        <div>\
            <div class="input-error-message -on-error -abs -color-negative"></div>\
            <header class="cv-post-creator__header -clearfix">\
                <input type="file" name="image" accept="image/.jpg, .png, .jpeg" class="image-input cv-button tiny -hide"/>\
            </header>\
            <div class="cv-post-creator__content -abs"></div>\
            <div class="cv-post-creator__disable"></div>\
        </div>\
    ',

    prototype : {
        el : null,
        header : null,
        content : null,

        init : function init(config) {
            CV.PostCreator.prototype.init.call(this, config);

            this.el = this.element[0];
            this.inputFile = this.el.querySelector('input[type="file"]');
            this.header = this.el.querySelector('.cv-post-creator__header');
            this.content = this.el.querySelector('.cv-post-creator__content');
            this.errorMessage = this.el.querySelector('.input-error-message');

            this.addCloseButton()._setup()._bindEvents()._disablePostButton();
        },

        _setup : function _setup() {
            this.appendChild(new CV.PostCreatorUploadingTemplate({
                name : 'uploadingTemplate'
            })).render(this.content);

            this.appendChild(new CV.PostCreatorErrorTemplate({
                name : 'errorTemplate'
            })).render(this.content);

            this.appendChild(new CV.PostCreatorSuccessTemplate({
                name : 'successTemplate'
            })).render(this.content);

            this.appendChild(new CV.PostCreatorPostButton({
                name : 'postButton',
                className : '-float-right -full-height -color-border-grey-light'
            })).render(this.header);

            this.appendChild(new CV.PostCreatorUploadFileHeaderMessages({
                name : 'headerStatus',
                className : '-overflow-hidden -full-height'
            })).render(this.header);

            return this;
        },

        _bindEvents : function _bindEvents() {
            CV.PostCreator.prototype._bindEvents.call(this);

            this._uploadFileRef = this._uploadFile.bind(this);
            Events.on(this.inputFile, 'change', this._uploadFileRef);

            this.postButton.bind('buttonClick', this._handlePostButtonClick.bind(this));
            return this;
        },

        /* Sends the current Post data to the server to be created.
         * @method _handlePostButtonClick <private>
         * @return undefined
         */
        _handlePostButtonClick : function _handlePostButtonClick() {
            var postEditedData = this._previewPostWidget.getEditedData();
            this._disablePostButton();

            API.postCreate({
                profileName : App.Voice.data.owner.profileName,
                voiceSlug : App.Voice.data.slug,
                posts : [postEditedData]
            }, this._savePostResponse.bind(this));
        },

        /* Handles the PostCreate API response.
         * Shows an error or success msg.
         * @method _savePostResponse <private>
         * @return undefined
         */
        _savePostResponse : function _savePostResponse(err, response) {
            var errorMessage = '';

            if (err) {
                errorMessage = 'Error - ' + response.status;
                return this._setErrorState({message: errorMessage}).enable();
            }

            this._setSuccessState();
        },

        /* Sets the error state.
         * @method _setErrorState <private> [Function]
         * @return [PostCreatorFromUrl]
         */
        _setErrorState : function _setErrorState(config) {
            if (config && config.message) {
                this.dom.updateText(this.errorMessage, config.message);
            } else {
                this.dom.updateText(this.errorMessage, this.constructor.DEFAULT_ERROR_MESSAGE);
            }

            if (this.el.classList.contains('has-error')) {
                return this;
            }

            if (this._previewPostWidget) {
                this._previewPostWidget.destroy();
            }

            this.el.classList.add('has-error');
            this.errorTemplate.activate();

            return this;
        },

        /* Display a success message and reloads the page if the API call to
         * create a new Post was successfull.
         * @method _setSuccessState <private>
         */
        _setSuccessState : function _setSuccessState() {
            this.el.classList.add('is-success');
            this.successTemplate.activate();

            window.setTimeout(function() {
                window.location.reload();
            }, 2000);

            return this;
        },

        /* Uploads the image selected.
         * @method _uploadFile <private>
         */
        _uploadFile : function _uploadFile() {
            this._statusUploadingImage();

            var data = new FormData();
            data.append('image',  this.inputFile.files[0]);

            API.uploadPostImage({
                profileName : App.Voice.data.owner.profileName,
                voiceSlug : App.Voice.data.slug,
                data : data
            }, function(err, res) {
                console.log(err);
                console.log(res);

                if (err) {
                    return this._statusErrorUploadingImage();
                }

                this._statusImageUploaded(res);
            }.bind(this));
        },

        /* Sets the widget state as uploading image.
         * @method _statusUploadingImage <private> [Function]
         */
        _statusUploadingImage : function _statusUploadingImage() {
            this.headerStatus.uploading();
            this.errorTemplate.deactivate();
            this.uploadingTemplate.activate();
            return this;
        },

        /* Sets the widget state as error.
         * @method _statusErrorUploadingImage <private> [Function]
         */
        _statusErrorUploadingImage : function _statusErrorUploadingImage() {
            this.headerStatus.error();
            this.errorTemplate.activate();
            this.uploadingTemplate.deactivate();
            return this;
        },

        /* Sets the widget state as image uploaded.
         * Creates a new EditablePost widget using the data passed.
         * @method _statusImageUploaded <private> [Function]
         * @return PostCreatorUploadFile
         */
        _statusImageUploaded : function statusImageUploaded(postData) {
            this.headerStatus.uploadedImage();
            this.errorTemplate.deactivate();
            this.uploadingTemplate.deactivate();

            if (this._previewPostWidget) {
                this._previewPostWidget = this._previewPostWidget.unedit().destroy();
            }

            postData.name = '_previewPostWidget';
            this.appendChild(CV.EditablePost.create(postData))
                .edit()
                .addImageControls()
                .render(this.content);

            this._enabledPostButton();
            return this;
        },

        _enabledPostButton : function _enabledPostButton() {
            this.postButton.enable();
            return this;
        },

        _disablePostButton : function _disablePostButton() {
            this.postButton.disable();
            return this;
        },

        _activate : function _activate(ev) {
            CV.PostCreator.prototype._activate.call(this);
            this.inputFile.click(ev);
        },

        destroy : function destroy() {
            CV.PostCreator.prototype.destroy.call(this);

            Events.off(this.inputFile, 'change', this._uploadFileRef);
            this._uploadFileRef = null;

            return null;
        }
    }
});
