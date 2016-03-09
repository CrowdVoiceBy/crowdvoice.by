/* jshint multistr: true */
var MediumEditor = require('medium-editor');

Class(CV, 'PostCreatorWriteArticleEditorBody').inherits(Widget)({

    ELEMENT_CLASS : 'write-article-editor-body',

    HTML : '\
        <div>\
            <div class="write-article-body-editable" contenteditable="true">\
            </div>\
        </div>',

    prototype : {

        el : null,
        body : null,
        editor : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.body= this.el.querySelector('.write-article-body-editable');

            this._setup();
        },

        _setup : function _setup() {
            this.editor = new MediumEditor(this.body, {
                targetBlank: true,
                anchor: {
                    linkValidation: true
                },
                placeholder: {
                    text: 'Start writing your article.'
                }
            });

            this.appendChild(new CV.UI.CenterModal({
                name : 'centeredModal',
                title : 'Give Your Article Some Style',
                buttonLabel : 'Got it',
                imageContent : '/img/article-editor.gif',
                checkbox : true,
                checkboxCookieName : 'onboardingArticle'
            })).render(this.el);

            if (document.cookie.indexOf(this.centeredModal.checkboxCookieName) >= 0) {
                this.centeredModal.destroy();
            } else {
                this.centeredModal.activate();
            }
            

            return this;
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.editor.destroy();

            this.el = null;
            this.body = null;
            this.editor = null;

            return null;
        }
    }
});
