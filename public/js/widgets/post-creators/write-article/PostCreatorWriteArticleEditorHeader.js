/* jshint multistr: true */
var autosize = require('autosize');

Class(CV, 'PostCreatorWriteArticleEditorHeader').inherits(Widget)({

    ELEMENT_CLASS : 'write-article-editor-header',

    HTML : '\
        <div class="-rel">\
            <textarea class="editor-title -block -font-bold" placeholder="Title"></textarea>\
        </div>\
    ',

    prototype : {

        el : null,
        titleElement : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.titleElement = this.el.querySelector('.editor-title');

            this._setup()._bindEvents();
        },

        _setup : function _setup() {
            this.appendChild(
                new CV.PostCreatorWriteArticleEditorCoverButton({
                    name : 'coverButton'
                })
            ).render(this.el);

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._renderHandlerRef = this._renderHandler.bind(this);
            this.bind('render', this._renderHandlerRef);

            return this;
        },

       /* Render event listener handler
        * Instantiate the editable textareas, they need to be on the DOMTree in order to work
        * @method _renderHandler <private> [Function]
        */
        _renderHandler : function _renderHandler() {
            setTimeout(function() {
                autosize(this.titleElement);
            }.bind(this), 0);
        },

        destroy : function destroy() {
            this.unbind('render', this._renderHandlerRef);
            this._renderHandlerRef = null;

            autosize.destroy(this.titleElement);
            this.el = null;

            Widget.prototype.destroy.call(this);

            return null;
        }
    }
});
