/* globals App */
var Events = require('./../../lib/events');
var transitionEnd = require('./../../lib/ontransitionend');

Class(CV.UI, 'Modal').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'cv-modal-container ui-modal',

    HTML : '\
        <div>\
            <div class="cv-modal__backdrop"></div>\
            <div class="cv-modal__inner">\
                <div class="cv-modal">\
                    <div class="header">\
                        <h3 class="title"></h3>\
                        <div class="line"></div>\
                    </div>\
                    <div class="body-wrapper">\
                        <div class="body -clear-after"></div>\
                    </div>\
                </div>\
            </div>\
        </div>',

    prototype : {
        title : null,
        action : null,
        data : null,
        width : null,
        modalElement : null,
        isAdmin : null,

        init : function(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            this.innerElement = this.el.querySelector('.cv-modal__inner');
            this.bodyElement = this.el.querySelector('.body');
            this.modalElement = this.el.querySelector('.cv-modal');

            if (this.action) {
                this.appendChild(new this.action({
                    data : this.data,
                    name : 'bubbleAction',
                    isAdmin : this.isAdmin
                })).render(this.bodyElement);
            }

            this._setup()._bindEvents();
        },

        /* Replaces the contents of the modal's body.
         * @method setContent <public> [Function]
         * @param content <required> [HTMLString, Function(widget), NodeElement] the new content
         * @return Modal
         */
        addContent : function addContent(content) {
            while(this.bodyElement.firstChild) {
                this.bodyElement.removeChild(this.bodyElement.firstChild);
            }

            if (typeof content === 'function') {
                this.appendChild(new this.action({
                    data : this.data,
                    name : 'bubbleAction',
                    isAdmin : this.isAdmin
                })).render(this.bodyElement);
                return this;
            }

           if (typeof content === 'string') {
               this.bodyElement.insertAdjacentHTML('beforeend', content);
               return this;
           }

            this.bodyElement.appendChild(content);
            return this;
        },

        _setup : function _setup() {
            this.appendChild(new CV.UI.Close({
                name : 'closeButton',
                className : '-abs -color-bg-white',
                svgClassName : '-s16'
            })).render(this.el.querySelector('.header'));

            if (this.width) {
                this.modalElement.style.width = this.width + 'px';
            }

            this.dom.updateText(this.el.querySelector('.title'), this.title);
            return this;
        },

        _bindEvents : function _bindEvents() {
            this._destroyRef = this._beforeDestroyHandler.bind(this);
            this._clickHandlerRef = this._clickHandler.bind(this);

            if (this.bubbleAction) {
                this.bubbleAction.bind('close', this._destroyRef);
            }
            Events.on(this.innerElement, 'click', this._clickHandlerRef);
            this.closeButton.bind('click', this._destroyRef);
            return this;
        },

        _clickHandler : function _clickHandler(ev) {
            if (ev.target === this.innerElement) {
                return this._beforeDestroyHandler();
            }
        },

        _activate : function _activate() {
            Widget.prototype._activate.call(this);
            App.hideScrollbar();
        },

        _beforeDestroyHandler : function _beforeDestroyHandler() {
            this.deactivate();
            transitionEnd(this.modalElement, function() {
                this.destroy();
            }.bind(this));
        },

        destroy : function destroy() {
            App.showScrollbar();
            Events.off(this.innerElement, 'click', this._clickHandlerRef);
            this._destroyRef = this.modalElement = this.el = null;
            Widget.prototype.destroy.call(this);
            return false;
        }
    }
});
