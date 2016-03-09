var Events = require('./../../../lib/events');

Class(CV, 'PostEditImageControls').inherits(Widget)({
    HTML : '\
    <div class="post-edit-image-controls">\
        <div class="post-edit-images-nav cv-button-group multiple -pr1">\
            <button class="images-nav-prev cv-button tiny -p0">\
                <svg class="post-edit-images-nav-svg">\
                    <use xlink:href="#svg-arrow-left"></use>\
                </svg>\
            </button>\
            <button class="images-nav-next cv-button tiny -p0">\
                <svg class="post-edit-images-nav-svg">\
                    <use xlink:href="#svg-arrow-right"></use>\
                </svg>\
            </button>\
        </div>\
        <input type="file" name="image" accept="image/.jpg, .png, .jpeg" class="-hide"/>\
        <div class="cv-button-group multiple">\
            <button class="image-replace cv-button tiny">Replace</button>\
            <button class="image-remove cv-button tiny">Remove</button>\
        </div>\
    </div>',

    prototype : {
        images : null,
        /* The Post sourceType
         */
        sourceType : null,

        _imagesLen : 0,
        prevButton : null,
        nextButton : null,
        removeButton : null,
        replaceButton : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.imagesNav = this.el.querySelector('.post-edit-images-nav');
            this.removeButton = this.el.querySelector('.image-remove');
            this.replaceButton = this.el.querySelector('.image-replace');
            this.inputFile = this.el.querySelector('input[type="file"]');
            this.prevButton = this.el.querySelector('.images-nav-prev');
            this.nextButton = this.el.querySelector('.images-nav-next');

            if (this.sourceType === 'image' || this.sourceType === 'video') {
                // images and videos require an image, so we disable the
                // remove image action.
                this.removeButton.parentElement.removeChild(this.removeButton);
            }

            this.updateImages(this.images)._bindEvents();
        },

        /* Updates the this.images reference holding the images.
         * Checks if the navigation buttons should be displayed.
         * @method updateImages <public> [Function]
         * @return PostEditImageControls
         */
        updateImages : function updateImages(images) {
            this.images = images;
            this._imagesLen = images.length;

            if (this._imagesLen > 1) {
                this.imagesNav.classList.add('active');
            }

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._removeImageClickHandlerRef = this._removeImageClickHandler.bind(this);
            Events.on(this.removeButton, 'click', this._removeImageClickHandlerRef);

            this._replaceImageClickHandlerRef = this._replaceImageClickHandler.bind(this);
            Events.on(this.replaceButton, 'click', this._replaceImageClickHandlerRef);

            this._uploadFileRef = this._uploadFile.bind(this);
            Events.on(this.inputFile, 'change', this._uploadFileRef);

            this._prevClickHandlerRef = this._prevClickHandler.bind(this);
            Events.on(this.prevButton, 'click', this._prevClickHandlerRef);

            this._nextClickHandlerRef = this._nextClickHandler.bind(this);
            Events.on(this.nextButton, 'click', this._nextClickHandlerRef);
        },

        _prevClickHandler : function _prevClickHandler(ev) {
            ev.stopPropagation();
            this.dispatch('prevImage');
        },

        _nextClickHandler : function _nextClickHandler(ev) {
            ev.stopPropagation();
            this.dispatch('nextImage');
        },

        _replaceImageClickHandler : function _replaceImageClickHandler(ev) {
            ev.stopPropagation();
            this.inputFile.click(ev);
        },

        _removeImageClickHandler : function _removeImageClickHandler(ev) {
            ev.stopPropagation();
            this.dispatch('removeImage');
        },

        /* Uploads the image selected.
         * @method _uploadFile <private>
         */
        _uploadFile : function _uploadFile() {
            this.dispatch('replaceImage', {image: this.inputFile.files[0]});
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            Events.off(this.removeButton, 'click', this._removeImageClickHandlerRef);
            this._removeImageClickHandlerRef = null;

            Events.off(this.replaceButton, 'click', this._replaceImageClickHandler);
            this._replaceImageClickHandlerRef = null;

            Events.off(this.prevButton, 'click', this._prevClickHandlerRef);
            this._prevClickHandlerRef = null;

            Events.off(this.nextButton, 'click', this._nextClickHandlerRef);
            this._nextClickHandlerRef = null;

            return null;
        }
    }
});
