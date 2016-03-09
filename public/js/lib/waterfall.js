(function(factory) {
    'use strict';

    if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        window.Waterfall = factory();
    }
}(function factory() {
    'use strict';

    function Waterfall(config) {
        this.settings = {
            containerElement : document.body,
            items : [],
            columnWidth : 0,
            gutter : 0,
            centerItems : false,
            positioning : '2d' // 2d|3d|xy
        };

        Object.keys(config || {}).forEach(function(propertyName) {
            this.settings[propertyName] = config[propertyName];
        }, this);

        this.AVAILABLE_WIDTH = 0;
        this._blocks = [];
        this._items = [].slice.call(this.settings.items, 0);
        this._spaceLeft = 0;

        this.settings.containerElement.style.position = 'relative';
    }

    Waterfall.prototype._setup = function _setup() {
        var c = this.settings.containerElement;
        var columnsCount = 0;

        this.AVAILABLE_WIDTH = (c.offsetWidth || c.innerWidth);
        this._colWidth = (this.settings.columnWidth || (this._getVisibleItems()[0] && ~~this._getVisibleItems()[0].getBoundingClientRect().width)) || 0;
        this._blocks = [];
        columnsCount = ~~(this.AVAILABLE_WIDTH / (this._colWidth + this.settings.gutter));

        if (this.settings.centerItems) {
            this._spaceLeft = (this.AVAILABLE_WIDTH - ((this._colWidth * columnsCount) + (this.settings.gutter * columnsCount - 1))) / 2;
        }

        for (var i = 0; i < columnsCount; i++) {
            this._blocks.push(this.settings.gutter);
        }

        this._fit();
    };

    Waterfall.prototype._fit = function _fit() {
        var i, x, y, index, height, item,
            coordsX = [],
            coordsY = [],
            items = this._getVisibleItems(),
            len = items.length,
            gutter = this.settings.gutter,
            colWidth = this._colWidth,
            spaceLeft = this._spaceLeft;

        for (i = 0; i < len; i++) {
            item = items[i];
            y = Math.min.apply(Math, this._blocks);
            index = this._blocks.indexOf(y);
            x = gutter + (index * (colWidth + gutter));
            height = item.offsetHeight;

            item.dataset.h = height;
            item.dataset.y = y;

            this._blocks[index] = y + height + gutter;

            coordsX.push(x);
            coordsY.push(y);
        }

        for (i = 0; i < len; i++) {
            item = items[i];
            item.style.position = 'absolute';

            if (this.settings.positioning === '3d') {
                item.style.transform = 'translate3d(' + (coordsX[i] + spaceLeft) + 'px,' + coordsY[i] + 'px,0)';
            } else if (this.settings.positioning === '2d') {
                item.style.transform = 'translateX(' + (coordsX[i] + spaceLeft) + 'px) translateY(' + coordsY[i] + 'px)';
            } else {
                item.style.left = (coordsX[i] + spaceLeft) + 'px';
                item.style.top = coordsY[i] + 'px';
            }
        }

        this.settings.containerElement.style.height = ~~Math.max.apply(Math, this._blocks) + 'px';

        i = x = y = index = item = coordsX = coordsY = items = len = gutter = colWidth = spaceLeft = null;
    };

    Waterfall.prototype._getVisibleItems = function _getVisibleItems() {
        return this.getItems().filter(function(item) {
            return item.offsetParent;
        });
    };

    Waterfall.prototype.layout = function layout() {
        this._setup();
    };

    Waterfall.prototype.addItems = function addItems(items) {
        this._items = this._items.concat([].slice.call(items, 0));
        return this;
    };

    Waterfall.prototype.removeItems = function removeItems(items) {
        items.forEach(function(item) {
            var index = this._items.indexOf(item);
            if (index > -1) {
                this._items.splice(index, 1);
            }
        }, this);
    };

    Waterfall.prototype.getItems = function getItems() {
        return this._items;
    };

    Waterfall.prototype.flushItems = function flushItems() {
        this._items = [];
    };

    Waterfall.prototype.destroy = function destroy() {
        var items = this._getVisibleItems();
        var i = 0, len = items.length, item;

        for (; i < len; i++) {
            item = items[i];
            item.removeAttribute('data-h');
            item.removeAttribute('data-y');
            item.style.position = '';

            if (this.settings.positioning === '3d' || this.settings.positioning === '2d') {
                item.style.transform = '';
            } else {
                item.style.left = '';
                item.style.top = '';
            }
        }

        this.settings.containerElement.style.position = '';
        this.settings.containerElement.style.height = '';

        this.settings = null;
        this.AVAILABLE_WIDTH = this._blocks = this._items = this._spaceLeft = null;

        return null;
    };

    return Waterfall;
}));
