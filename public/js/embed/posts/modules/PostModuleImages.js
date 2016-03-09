/* global ImageHalt */
/* Module PostModuleImages
 * Methods to handle cover images.
 * Show/hide/set/update/load/abort current post cover image.
 */

// require('../../../lib/image-halt');

Module(CV, 'PostModuleImages')({
    prototype : {
        /* PRIVATE properties */
        imageLoaded : false,
        haltImage : null,

        hasCoverImage : function hasCoverImage() {
            return this.postImages && this.postImages.medium && this.postImages.medium.url;
        },

        /* Updates the cover image with the passed sourceString.
         * @method setCoverImage <public> [Function]
         */
        setCoverImage : function setCoverImage(src) {
            var cover = (this.imageWidth >= 300) ? 'add' : 'remove';
            this.imageWrapperElement.classList[cover]('-img-cover');
            this.dom.updateBgImage(this.imageWrapperElement, src);
            return this;
        },

        /* Sets the image height equal to the number passed in pixel units.
         * @method setImageHeight <public> [Function[]
         */
        setImageHeight : function setImageHeight(height) {
            this.imageWrapperElement.style.height = height + 'px';
            this.showImageWrapper();
        },

        /* Display the image wrapper element which contains the image cover.
         * @method showImageWrapper <public> [Function]
         */
        showImageWrapper : function showImageWrapper() {
            this.imageWrapperElement.classList.add('active');
        },

        /* Hides the image wrapper element which contains the image cover.
         * @method hideImageWrapper <public> [Function]
         */
        hideImageWrapper : function hideImageWrapper() {
            this.imageWrapperElement.classList.remove('active');
        },

        /* Preload Post Image Cover
         * @method loadImage <public> [Function]
         * @return [CV.Post]
         */
        loadImage : function loadImage() {
            if (!this.hasCoverImage()) {return this;}
            if (this.imageLoaded === true) {return this;}

            if (this.haltImage) {
                this.haltImage.load();
                return this;
            }

            this._loadImageHandlerRef = this._loadImageHandler.bind(this);
            this.haltImage = new ImageHalt(this.postImages.medium.url, this._loadImageHandlerRef);
            this.haltImage.load();

            return this;
        },

        /* Cancel the post's cover image transfer.
         * @method abortImage <public> [Function]
         * @return [CV.Post]
         */
        abortImage : function abortImage() {
            if (!this.hasCoverImage()) {return this;}
            if (!this.haltImage) {return this;}
            if (this.imageLoaded === true) {return this;}

            this.haltImage.abort();

            return this;
        },

        /* Handler the image error, load events.
         * @method _loadImageHandler <private> [Function]
         */
        _loadImageHandler : function _loadImageHandler(err, imageObject) {
            if (err) {
                this.abortImage();
                this.haltImage = null;
                return;
            }

            this.setCoverImage(imageObject.src);
            this.imageLoaded = true;
            this.haltImage = null;
        }
    }
});
