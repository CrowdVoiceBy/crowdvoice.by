/* globals App */
var API = require('../../lib/api');
var Gemini = require('gemini-scrollbar');

Class(CV, 'Search').inherits(Widget)({
    ELEMENT_CLASS : 'cv-search-overlay',

    HTML : '\
        <div>\
            <header class="cv-search-overlay__header">\
                <p class="header-title -color-neutral-mid">Type in what you’re looking for and press enter to search.</p>\
            </header>\
            <div class="cv-search-overlay__input -rel">\
                <svg class="input-search-icon -s20 -abs -color-neutral-mid">\
                    <use xlink:href="#svg-search"></use>\
                </svg>\
            </div>\
            <div class="cv-search-overlay__results">\
                <div class="gm-scrollbar -vertical">\
                    <span class="thumb"></span>\
                </div>\
                <div class="gm-scrollbar -horizontal">\
                    <span class="thumb"></span>\
                </div>\
                <div class="gm-scroll-view"></div>\
            </div>\
        </div>',

    prototype : {
        _lastSearchQuery : '',
        _queryRe : null,
        _queryRe2 : null,
        _keypressTimer : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.inputWrapper = this.el.querySelector('.cv-search-overlay__input');

            this.scrollbar = new Gemini({
                element : this.el.querySelector('.cv-search-overlay__results'),
                createElements : false
            }).create();

            this._queryRe = new RegExp('[^A-Za-z0-9\\p{L}\\p{Nd}]+','g');
            this._queryRe2 = new RegExp('[\\ ~`!#$%\\^&*+=\\-\\[\\]\';,{}|":<>\\?]','g');

            this.appendChild(new CV.UI.Close({
                name : 'closeButton',
                className : 'cv-search-overlay__close -abs',
                svgClassName : '-s18'
            })).render(this.el.querySelector('.cv-search-overlay__header'));

            this.appendChild(new CV.Loading({
                name : 'loader',
                className: '-abs',
                size : 40
            })).render(this.inputWrapper).setStyle({
                right: '-156px',
                top: '15px',
                webkitTransformOrigin: '0 0',
                msTransformOrigin: '0 0',
                transformOrigin: '0 0'
            });

            this.appendChild(new CV.InputClearable({
                name : 'input',
                placeholder : 'Search...',
                inputClass : '-block -lg -br0'
            })).render(this.inputWrapper);

            this.appendChild(new CV.SearchResultsManager({
                name : 'resultsManager'
            })).render(this.scrollbar.getViewElement());

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._closeElementClickHandlerRef = this._closeElementClickHandler.bind(this);
            this.closeButton.bind('click', this._closeElementClickHandlerRef);

            this._inputKeyPressHandlerRef = this._inputKeyPressHandler.bind(this);
            this.input.getElement().addEventListener('keyup', this._inputKeyPressHandlerRef);

            return this;
        },

        _inputKeyPressHandler : function _inputKeyPressHandler() {
            var _this = this;
            var inputValue = encodeURIComponent(this.input.getValue());

            if (this._keypressTimer) {
                window.clearTimeout(this._keypressTimer);
            }

            if (inputValue.length <= 2) {
                return void 0;
            }

            if (inputValue === this._lastSearchQuery) {
                return void 0;
            }

            this._keypressTimer = window.setTimeout(function() {
                window.clearTimeout(_this._keypressTimer);
                _this._lastSearchQuery = inputValue;
                _this._setSearchingState()._requestSearchResults(inputValue);
            }, 200);
        },

        _closeElementClickHandler : function _closeElementClickHandler() {
            this.dispatch('close');
        },

        _setSearchingState : function _setSearchingState() {
            this.input.hideClearButton();
            this.loader.activate();
            return this;
        },

        _setResponseState : function _setResponseState() {
            this.input.showClearButton();
            this.loader.deactivate();
            return this;
        },

        _requestSearchResults : function _requestSearchResults(queryString) {
            API.search({query: queryString}, function(err, res) {
                console.log(err);
                console.log(res);
                this.resultsManager.clearResults().renderResults(res, queryString);
                this.scrollbar.update();
                this._setResponseState();
            }.bind(this));
        },

        _activate : function _activate() {
            Widget.prototype._activate.call(this);
            App.hideScrollbar();
            this.input.getElement().focus();
        },

        _deactivate : function _deactivate() {
            Widget.prototype._deactivate.call(this);
            App.showScrollbar();
        },

        destroy : function destroy() {
            this.closeButton.unbind('click', this._closeElementClickHandlerRef);
            this._closeElementClickHandlerRef = null;

            Widget.prototype.destroy.call(this);
            return null;
        }
    }
});
