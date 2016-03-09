var Events = require('./../../lib/events');

Class(CV, 'UploadImage').inherits(CV.Image)({
    ELEMENT_CLASS : 'cv-upload-image',
    HTML : '\
        <div class="form-field">\
            <label><span></span></label>\
            <div class="-table">\
                <div class="cv-image cv-upload-image__image-wrapper -table-cell">\
                    <div class="placeholder"></div>\
                </div>\
                <div class="cv-upload-image__button-wrapper -table-cell -vam">\
                    <button class="cv-button tiny" data-button>Replace</button>\
                    <p class="button-hint"></p>\
                    <input type="file" name="upload" accept="image/.jpg, .png, .jpeg" class="-hide"/>\
                </div>\
            </div>\
        </div>',

    prototype : {
        init : function init(config) {
            CV.Image.prototype.init.call(this, config);

            if (this.data.buttonWrapperClassName) {
                this.dom.addClass(this.el.querySelector('.cv-upload-image__button-wrapper'), this.data.buttonWrapperClassName.split(' '));
            }

            if (this.data.buttonHint) {
                this.dom.updateText(this.el.querySelector('.button-hint'), this.data.buttonHint);
            }

            if (this.data.showRemoveButton) {
                var parentElement = this.uploadBgButton.parentNode;
                var buttonsGroup = document.createElement('div');

                this.removeBgButton = this.uploadBgButton.cloneNode();
                this.removeBgButton.textContent = 'Remove';

                buttonsGroup.className = 'cv-button-group multiple';
                buttonsGroup.appendChild(this.uploadBgButton);
                buttonsGroup.appendChild(this.removeBgButton);
                parentElement.insertBefore(buttonsGroup, parentElement.firstChild);

                Events.on(this.removeBgButton, 'click', this.removeImage.bind(this));
            }
        }
    }
});
