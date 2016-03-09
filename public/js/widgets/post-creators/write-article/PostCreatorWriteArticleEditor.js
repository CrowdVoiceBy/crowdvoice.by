/* jshint multistr: true */
Class(CV, 'PostCreatorWriteArticleEditor').inherits(Widget)({

    ELEMENT_CLASS : 'write-article-editor',

    HTML : '<div class="-full-height"></div>',

    prototype : {
        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            this._setup();
        },

        _setup : function _setup() {
            this.appendChild(
                new CV.PostCreatorWriteArticleEditorHeader({
                    name : 'editorHeader'
                })
            ).render(this.el);

            this.appendChild(
                new CV.PostCreatorWriteArticleEditorBody({
                    name : 'editorBody'
                })
            ).render(this.el);
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.el = null;
        }
    }
});
