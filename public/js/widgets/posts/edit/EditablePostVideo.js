Class(CV, 'EditablePostVideo').inherits(CV.PostVideo).includes(CV.EditablePost)({
    prototype : {
        _renderHandlerRef : null,

        init : function init(config) {
            CV.PostVideo.prototype.init.call(this, config);

            this._renderHandlerRef = this._renderHandler.bind(this);
            this.bind('render', this._renderHandlerRef);
        },

        _renderHandler : function _renderHandler() {
            this.setup();
        },

        destroy : function destroy() {
            this.unbind('render', this._renderHandlerRef);
            this._renderHandlerRef = null;

            this.el.parentElement.removeChild(this.el);

            CV.PostVideo.prototype.destroy.call(this);
            return null;
        }
    }
});
