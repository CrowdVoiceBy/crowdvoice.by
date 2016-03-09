var GeminiScrollbar = require('gemini-scrollbar');
var ScrollTo = require('./../../lib/scrollto');

Class(CV, 'PostDetailSidebar').inherits(Widget).includes(BubblingSupport)({
    ELEMENT_CLASS : 'cv-post-detail__sidebar -full-height',
    HTML : '\
        <div>\
            <div class="cv-post-detail__sidebar-filter"></div>\
            <div class="cv-post-detail__sidebar-scrollbar">\
                <div class="gm-scrollbar -vertical">\
                    <div class="thumb"></div>\
                </div>\
                <div class="gm-scrollbar -horizontal">\
                    <div class="thumb"></div>\
                </div>\
                <div class="gm-scroll-view"></div>\
            </div>\
        </div>',

    prototype : {
        _activatedItem : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            this.filterDropdown = new CV.VoiceFilterPostsDropdown({
                dropdownClassName : 'dark'
            }).render(this.el.querySelector('.cv-post-detail__sidebar-filter'));

            this.scrollbar = new GeminiScrollbar({
                element: this.el.querySelector('.cv-post-detail__sidebar-scrollbar'),
                createElements: false,
                autoshow: true
            }).create();

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this.bind('deactivate', this._bubbledDeactivate);

            this._filterSelectionUpdatedRef = this._filterSelectionUpdated.bind(this);
            this.filterDropdown.bind('selectionUpdated', this._filterSelectionUpdatedRef);
            return this;
        },

        /* Destroys any sidebar children and creates them using the new posts
         * array passed. This allow us to keep the order of thumbs intact and
         * updated everytime we get new posts fetched from the server.
         * @public
         * @param {Array} posts - the new fetched posts to add to the sidebar
         */
        updateItems : function updateItems(posts) {
            while(this.children.length > 0) {
                this.children[0].destroy();
            }

            posts.forEach(function(post) {
                this.appendChild(new CV.PostDetailSidebarItem({
                    name : 'item_' + post.id,
                    data : post
                })).render(this.scrollbar.getViewElement());
            }, this);

            this.filterItems(this.filterDropdown.getSelectedSourceTypes());

            this.scrollbar.update();
        },

        /* Iterate over all items and deactivate them, activates the one passed
         * as currently active and scrollsInto the activate thumb.
         * @public
         * @param {Object} item - the current active PostInstance
         */
        activateItem : function activateItem(item) {
            this._activatedItem = null;

            this.children.forEach(function(post) {
                if (post.data === item) {
                    this._activatedItem = post.activate();
                } else {
                    post.deactivate();
                }
            }, this);

            if (this._activatedItem) {
                ScrollTo(this.scrollbar.getViewElement(), {
                    y: this._findPos(this._activatedItem.el) - 83,
                    duration: 600
                });
            }
        },

        filterItems : function filterItems(sourceTypes) {
            var showAll = false;

            if (!sourceTypes) {
                showAll = true;
            }

            function showAllFn(post) {
                post.el.style.display = 'block';
            }

            function filterFn(post) {
                if (sourceTypes.indexOf(post.data.sourceType) < 0) {
                    post.el.style.display = 'none';
                } else {
                    post.el.style.display = 'block';
                }
            }

            if (showAll) {
                this.children.forEach(showAllFn);
            } else {
                this.children.forEach(filterFn);
            }
        },

        _bubbledDeactivate : function _bubbledDeactivate(ev) {
            ev.stopPropagation();
        },

        _filterSelectionUpdated : function _filterSelectionUpdated(ev) {
            this.filterItems(ev.sourceTypes);
        },

        /* Returns the Element top position.
        * @private|helper
        */
        _findPos: function _findPos(obj) {
          var curtop = 0;
          if (obj.offsetParent) {
            do {
              curtop += obj.offsetTop;
            } while (obj = obj.offsetParent);
            return curtop;
          }
        },

        destroy : function destroy() {
            this.unbind('deactivate', this._bubbledDeactivate);
            this.scrollbar = this.scrollbar.destroy();

            this.filterDropdown.unbind('selectionUpdated', this._filterSelectionUpdatedRef);
            this._filterSelectionUpdatedRef = null;

            Widget.prototype.destroy.call(this);
            return null;
        }
    }
 });
