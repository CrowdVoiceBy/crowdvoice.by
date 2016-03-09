Module('ImageHaltSafari')({
    prototype : {
        /* Implementation to start downloading the image.
         * @method __load <private, abstract> [Function]
         */
        __load : function __load() {
            if (typeof this._iframe === 'undefined') {
                this._iframe = document.createElement('iframe');
                this._iframe.setAttribute('src', 'about:blank');
                this._iframe.style.display = 'none';
                document.body.appendChild(this._iframe);
                this._iframe.contentDocument.body.appendChild(this._image);
            }

            this._image.setAttribute('src', this.imageSource);
        },

        /* Implementation to halt the image download.
         * @method __abort <private, abstract> [Function]
         */
        __abort : function __abort() {
            this._iframe.contentWindow.stop();
        },

        /* Implementation to clear the instance references.
         * @method __destroy <private, abstract> [Function]
         */
        __destroy : function __destroy() {
            document.body.removeChild(this._iframe);
            this._iframe = null;
        }
    }
});
