Class(CV, 'TabsManager').includes(NodeSupport, CustomEventSupport)({
    prototype : {
        useHash : false,
        nav : null,
        content : null,
        contentData : null,

        /* config.nav <required> [NodeElement] the element to append the tabs
         * config.content <required> [NodeElement] the element to append the contents
         */
        init : function init(config) {
            Object.keys(config || {}).forEach(function(propertyName) {
                this[propertyName] = config[propertyName];
            }, this);
        },

        /* Auto start === auto-activate a tab.
         * If this.useHash is true, it will check the hash and activate the
         * correct one if found, otherwise it will activate the 1st tab.
         * @method start <public> [Function]
         * @return CV.TabsManager
         */
        start : function start() {
            if (this.children.some(function(child) {
                return child.active;
            })) {
                return this;
            }

            if (!this.useHash) {
                this.children[0].activate();
                return this;
            }

            var hash = window.location.hash;
            var hashMatch = this.children.some(function(child) {
                if (('#' + child.name) === hash) {
                    child.activate();
                    return true;
                }
            });

            if (!hashMatch) {
                this.children[0].activate();
            }

            return this;
        },

        /* Register a tab.
         * @argument config <required> [Object]
         * @argument config.name <required> [String] Tab identifier.
         * @argument config.title <required> [String] The nav label.
         * @argument config.content <required> [Function] A widget.
         * @argument config.contentData <optional> [Object] Data to pass to the content widget.
         * @return CV.TabsManager
         */
        addTab : function addTab(config) {
            this.appendChild(new CV.Tab(config));

            this[config.name].nav.render(this.nav);
            this[config.name].content.render(this.content);

            this._beforeActivateRef = this._beforeActivate.bind(this);
            this[config.name].bind('beforeActivate', this._beforeActivateRef);

            return this;
        },

        /* Activate a tab either by name or index.
         * @method activateTab <public> [Function]
         * @argument tab <required> [String, Number]
         * @return CV.Tab
         */
        activateTab : function activateTab(tab) {
            if (typeof tab === 'string') {
                return this[tab].activate();
            }

            if (typeof tab === 'number') {
                return this.children[tab].activate();
            }
        },

        /* Adds the interactive tab indicator which updates its position when a
         * tab gets activated.
         * @method addTabIndicator <public> [Function]
         * @return TabsManager
         */
        addTabIndicator : function addTabIndicator() {
            if (typeof this.tabIndicator === 'undefined') {
                this.appendChild(new CV.TabIndicator({
                    name : 'tabIndicator'
                })).render(this.nav);
            }

            return this;
        },

        /* Listener of CV.Tab beforeActivate.
         * Updates the hash of useHash is truthy.
         * Deactivate the other children tabs.
         * @method _beforeActivate <private> [Function]
         */
        _beforeActivate : function _beforeActivate(ev) {
            if (this.useHash) {
                window.location.hash = ev.target.name;
            }

            this.children.forEach(function(child) {
                if (child.name !== ev.target.name) {
                    child.deactivate();
                }
            });

            if (this.tabIndicator) {
                this.tabIndicator.update(ev.target.nav.el);
            }
        }
    }
});
