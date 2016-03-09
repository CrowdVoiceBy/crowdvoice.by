Class(CV, 'Tab').inherits(Widget)({
    prototype : {
        title : null,
        content : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            if (typeof this.nav === 'function') {
                this.navData = this.navData || {};
                this.navData.name = 'nav';
                this.appendChild(new this.nav(this.navData));
            } else {
                this.appendChild(new CV.TabNav({
                    name : 'nav',
                    title : this.title
                })).setup();
            }

            this.appendChild(new CV.TabContent({
                name : 'content',
                content : this.content,
                data : this.contentData || null
            }));

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._activateRef = this.activate.bind(this);
            this.nav.bind('click', this._activateRef);
        },

        getContent : function getContent() {
            return this.content.content;
        },

        activate : function activate() {
            Widget.prototype.activate.call(this);
            this.nav.activate();
            this.content.activate();

            return this;
        },

        deactivate : function deactivate() {
            Widget.prototype.deactivate.call(this);
            this.nav.deactivate();
            this.content.deactivate();
            return this;
        }
    }
});
