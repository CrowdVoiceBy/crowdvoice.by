Class(CV.UI, 'InputButtonResults').inherits(Widget).includes(CV.WidgetUtils, BubblingSupport)({
    HTML : '<ul></ul>',
    ELEMENT_CLASS : 'cv-list-results',
    prototype : {
        _selected : null,
        init : function(config){
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
        },

        /* Add a new ListItem
         * @method add <public>
         * @argument config.element <required> the DOM element to be added
         * @argument config.data <optional> the data to be returned on element click
         * @return InputButtonResults [Object]
         */
        add : function add(config) {
            this.appendChild(new CV.UI.InputButtonResultsItem({
                name : 'item_' + this.children.length,
                content : config.element,
                data : config.data
            })).render(this.el);
            return this;
        },

        /* Returns the ListElement
         * @method getElement <public>
         * @return this.el [HTMLElement]
         */
        getElement : function getElement() {
            return this.el;
        },

        /* Select the next Item on the List.
         * @method selectNext <public>
         */
        selectNext : function selectNext() {
            if (!this.children) {
                return;
            }

            if (!this._selected) {
                return this._select(this.children[0]);
            }

            var next = this._selected.getNextSibling();
            this._selected.deactivate();

            if (next) {
                return this._select(next);
            }

            return this._select(this.children[0]);
        },

        /* Select the previous Item on the List.
         * @method selectPrev <public>
         */
        selectPrev : function selectPrev() {
            if (!this.children) {
                return;
            }

            if (!this._selected) {
                return this._select(this.children[this.children.length - 1]);
            }

            var prev = this._selected.getPreviousSibling();
            this._selected.deactivate();

            if (prev) {
                return this._select(prev);
            }

            return this._select(this.children[this.children.length - 1]);
        },

        /* Returns the current selected Item.
         * @method getSelectedElement <public>
         */
        getSelectedElement : function getSelectedElement() {
            var res = null;
            if (this._selected) {
                res = this._selected.el;
            }
            return res;
        },

        /* Clears the List.
         * @method clear <public>
         */
        clear : function clear() {
            this._selected = null;
            while(this.children.length > 0) {
                this.children[0].destroy();
            }
            return this;
        },

       /* Sets an item as selected.
        * @method _select <private>
        */
        _select : function _select(child) {
            this._selected = child;
            child.activate();
        }
    }
});
