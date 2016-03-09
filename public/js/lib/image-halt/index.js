require('./halt-default');
require('./halt-safari');

/* Main Class. Holds the behaviour that can run on all implementations.
 * This class accomplishes cross-browser through a strategy of module inclusion.
 * That is that once the browser is determined, the module that holds the specific behaviour is included into the class.
 * @argument imageSource <required> [String] (undefined) path to the image file
 */
Class('ImageHalt').includes(CustomEventSupport)({

    /* Holds the implementation Object.
     * @property _implementation <protected, static> [Object] ImageHaltDefault
     */
    _implementation : ImageHaltDefault,
    BLANK : 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',

    /* Based in the natigator.userAgent, checks if the implementation needs to be changed.¬
     * @method _updateImplementation <protected, static> [Function]¬
     */
    _discoverImplementation : function _discoverImplementation() {
        if (/^((?!chrome).)*safari/i.test(window.navigator.userAgent)) {
            this._implementation = ImageHaltSafari;
        }
    },

    prototype : {

        imageSource: '',
        callback: null,

        _image : null,
        __loaded : false,

        init : function init(imageSource, callback) {
            this.imageSource = imageSource;
            this.callback = callback;
        },

        /* Creates a new image object and start listening for it to load.
         * @method load <public> [Function]
         */
        load : function load() {
            if (this.__loaded === true) {
                console.warn('Calling load on loaded image');
                return this;
            }

            if (this._image) {
                this._unsubscribe();
                this._image = null;
            }

            this._image = new Image();
            this._subscribe().__load();

            return this;
        },

        /* Returs true if the image has been loaded already, or false if it has not.
         * @method isLoaded <public> [Function]
         * @returns [Boolean] if the image has already been loaded
         */
        isLoaded : function isLoaded() {
            return this.__loaded;
        },

        /* Cancel the image transfer.
         * @method abort <public> [Function]
         * @return this [ImageHalt]
         */
        abort : function abort() {
            if (this.__loaded === true) {
                console.warn('Calling abort on loaded image');
                return this;
            }

            this._unsubscribe().__abort();

            return this;
        },

        /* Bind event handlers for image object.
         * @method _subscribe <private> [Function]
         */
        _subscribe : function _subscribe() {
            this._loadHandlerRef = this._loadHandler.bind(this);
            this._image.addEventListener('load', this._loadHandlerRef);

            this._errorHandlerRef = this._errorHandler.bind(this);
            this._image.addEventListener('error', this._errorHandlerRef);

            return this;
        },

        /* Unbind events handlers forw the image object.
         * @method _unsubscribe <private> [Function]
         */
        _unsubscribe : function _unsubscribe() {
            this._image.removeEventListener('load', this._loadHandlerRef);
            this._loadHandlerRef = null;

            this._image.removeEventListener('error', this._errorHandlerRef);
            this._errorHandlerRef = null;

            return this;
        },

        _loadHandler : function() {
            this.__loaded = true;
            this._destroy().callback(null, this._image, this.options);
        },

        _errorHandler : function(ev) {
            this.callback(new Error(ev), this._image, this.options);
        },

        /* Unbind events (if needed), nullify references and remove elements.
         * @method destroy <private> [Function]
         * @return null
         */
        _destroy : function destroy() {
            this._unsubscribe().__destroy();

            return this;
        },

        /* Implementation to start fetching the image.
         * Based on the userAgent we may have to do different things so we can later abort the image loading if needed.
         * All implementations should include this method.
         * @method __load <private, abstract> [Function]
         */
        __load : function __load() {
            throw new Error('ImageHalt.prototype._load not implemented');
        },

        /* Implementation to halt the image loading.
         * Browsers can handle this differently, so based on userAgent we can determine which module to load.
         * All implementations should include this method.
         * @method __abort <private, abstract> [Function]
         */
        __abort : function _abort() {
            throw new Error('ImageHalt.prototype._abort not implemented');
        },

        /* Implementation of _destroy.
         * All implementations should include this method.
         * @method __destroy <private, abstract> [Function]
         */
        __destroy : function _destroy() {
            throw new Error('ImageHalt.prototype._destroy not implemented');
        }
    }
});

ImageHalt._discoverImplementation();
ImageHalt.include(ImageHalt._implementation);
