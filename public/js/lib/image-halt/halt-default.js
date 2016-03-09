Module('ImageHaltDefault')({
    prototype : {
        /* Implementation to start downloading the image.
          * @method __load <private, abstract> [Function]
          */
         __load : function __load() {
             this._image.setAttribute('src', this.imageSource);
         },

         /* Implementation to halt the image download.
          * @method __abort <private, abstract> [Function]
          */
         __abort : function __abort() {
             this._image.setAttribute('src', this._BLANK);
         },

         /* Implementation to clear the instance references.
          * @method __destroy <private, abstract> [Function]
          */
         __destroy : function __destroy() {
             /* silence */
         }
    }
});
