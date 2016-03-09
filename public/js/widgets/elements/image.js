var Events = require('./../../lib/events');

Class(CV, 'Image').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : '',
    HTML : '\
        <div class="form-field">\
            <label><span></span></label>\
            <div class="cv-image">\
                <div class="placeholder"></div>\
                <a class="button cv-button full" data-button>Replace</a>\
                <input type="file" name="upload" accept="image/.jpg, .png, .jpeg" class="-hide"/>\
            </div>\
        </div>\
    ',
    prototype : {
        data : {
            title  : ''
        },

        _error : false,

        /* Holds if the removeImage method was called to clear the values.
         * @property imageRemoved <public> [Boolean]
         */
        imageRemoved : false,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this.imageWrapper = this.el.querySelector('.cv-image');
            this.backgroundImage = this.el.querySelector('.placeholder');
            this.uploadBgButton = this.el.querySelector('[data-button]');
            this.uploadFile = this.el.querySelector('[name="upload"]');

            this._setup()._bindEvents();
        },

        setImage : function setImage(path) {
            this.backgroundImage.classList.add('-img-contain');
            this.dom.updateBgImage(this.backgroundImage, path);
            return this;
        },

        /* Sets the property `imageRemoved` as true, resets the uploadedFile
         * and removes the preview background image. Useful if you are relaying
         * on the `imageRemoved` flag to determinate a different user's intention.
         * @method removeImage <public>
         */
        removeImage : function removeImage() {
            this.imageRemoved = true;
            this.reset();
            return this;
        },

        /* Sets error state feedback.
         * @method error <public>
         */
        error : function error() {
            this._error = true;
            this.imageWrapper.classList.add('-is-error');
            return this;
        },

        hasError : function hasError() {
            return this._error;
        },

        getFile : function getFile() {
            return this.uploadFile.files[0];
        },

        isEmpty : function isEmpty() {
            return (!this.getFile() && !this.backgroundImage.style.backgroundImage);
        },

        /* Resets the uploadedFile and removes the preview background image.
         * @method reset <public>
         */
        reset : function reset() {
            this.uploadFile.value = '';
            this.backgroundImage.classList.remove('-img-contain');
            this.backgroundImage.removeAttribute('style');
            return this;
         },

        /* Clear feedback states.
         * @method clearState <public>
         */
        clearState : function clearState() {
            this._error = false;
            this.dom.removeClass(this.imageWrapper, ['-is-error']);
            return this;
        },

        _setup : function _setup() {
            if (this.data.title) {
                this.dom.updateText(this.el.querySelector('label'), this.data.title);
            } else {
                this.el.removeChild(this.el.querySelector('label'));
            }

            if (this.data.accept) {
                this.uploadFile.setAttribute('accept', this.data.accept);
            }

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._triggerFileUploadRef = this._triggerFileUpload.bind(this);
            Events.on(this.uploadBgButton, 'click', this._triggerFileUploadRef);

            this._previewImageRef = this._previewImage.bind(this);
            Events.on(this.uploadFile, 'change', this._previewImageRef);

            return this;
        },

        /* Trigger the hidden file upload for the background image.
         */
        _triggerFileUpload : function _triggerFileUpload(ev) {
            this.uploadFile.click(ev);
        },

        /* Background input file change listener callback.
         * Creates a preview of the image to be uploaded.
         */
        _previewImage : function _previewImage() {
            var f = this.getFile();
            var r = new FileReader();

            this.clearState();

            if (f.type.match('image.*')) {
                r.onload = function(e) {
                    this.setImage(e.target.result);
                    this.imageRemoved = false;
                    r.onload = null;
                }.bind(this);
                return r.readAsDataURL(f);
            }

            this.error();
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.off(this.uploadBgButton, this._triggerFileUploadRef);
            this._triggerFileUploadRef = null;
            return null;
        }
    }
});
