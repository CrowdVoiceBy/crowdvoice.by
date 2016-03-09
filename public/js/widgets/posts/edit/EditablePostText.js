var rome = require('rome');
Class(CV, 'EditablePostText').inherits(CV.PostText).includes(CV.EditablePost)({
    prototype : {
        _renderHandlerRef : null,

        init : function init(config) {
            CV.PostText.prototype.init.call(this, config);

            this._renderHandlerRef = this._renderHandler.bind(this);
            this.bind('render', this._renderHandlerRef);
        },

        _renderHandler : function _renderHandler() {
            this.setup();
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
                title : this.format.truncate(this.title, this.constructor.MAX_LENGTH_TITLE),
                description : this.description|| ' ',
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

        edit : function edit() {
            this.el.classList.add('edit-mode');
            this.titleElement.classList.add('-font-bold');

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

        destroy : function destroy() {
            this.unbind('render', this._renderHandlerRef);
            this._renderHandlerRef = null;

            this.el.parentElement.removeChild(this.el);

            CV.PostText.prototype.destroy.call(this);
            return null;
        }
    }
});
