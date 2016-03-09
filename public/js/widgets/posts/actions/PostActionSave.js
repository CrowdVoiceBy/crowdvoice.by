var API = require('./../../../lib/api');
var Events = require('./../../../lib/events');

Class(CV, 'PostActionSave').inherits(Widget)({
    ELEMENT_CLASS : 'post-card-actions-item -col6 -clickable',

    HTML_SAVE : '\
        <svg class="post-card-activity-svg">\
            <use xlink:href="#svg-save"></use>\
        </svg>\
        <p class="post-card-actions-label">Save</p>',

    HTML_SAVED : '\
        <div class="saved-button -color-positive">\
            <svg class="post-card-activity-svg">\
                <use xlink:href="#svg-saved-posts"></use>\
            </svg>\
            <p class="post-card-actions-label">Saved</p>\
        </div>\
        <div class="unsave-button -color-negative">\
            <svg class="post-card-activity-svg">\
                <use xlink:href="#svg-save-outline"></use>\
            </svg>\
            <p class="post-card-actions-label">Unsave</p>\
        </div>',

    prototype : {
        /* the PostEntity */
        entity : null,

        init : function init (config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];

            if (this.entity.saved) {
                this._setIsSaved();
            } else {
                this._setIsNotSaved();
            }

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            Events.on(this.el, 'click', this._clickHandlerRef);
            return this;
        },

        /* Sets the button state as if currentPerson has saved this Post
         * @method _setIsSaved <private>
         */
        _setIsSaved : function _setIsSaved() {
            this.entity.saved = true;

            this.el.innerHTML = '';
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_SAVED);

            this.appendChild(new CV.PopoverUnsave({
                name : 'unsavePopoverContent'
            }));

            this.appendChild(new CV.PopoverBlocker({
                name : 'unsavePopover',
                className : 'unfollow-popover',
                placement : 'top',
                content : this.unsavePopoverContent.el
            })).render(this.el);

            this.unsavePopoverContent.bind('unsave', this._unsaveHandler.bind(this));
            this.unsavePopoverContent.bind('cancel', this._cancelHandler.bind(this));

            this.unsavePopover.bind('activate', this.activate.bind(this));
            this.unsavePopover.bind('deactivate', this.deactivate.bind(this));
            this.unsavePopover.bind('destroy', this.deactivate.bind(this));

            return this;
        },

        /* Sets the button state as if currentPerson has not saved this Post.
         * @method _setIsNotSaved <private>
         */
        _setIsNotSaved : function _setIsNotSaved() {
            this.entity.saved = false;

            if (this.unsavePopover) {
                this.unsavePopover = this.unsavePopover.destroy();
            }

            if (this.unsavePopoverContent) {
                this.unsavePopoverContent = this.unsavePopoverContent.destroy();
            }

            this.el.innerHTML = '';
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_SAVE);
            return this;
        },

       /* Click button handler. Is in charge of deciding which API endpoint to call.
        * @method _clickHandler <private>
        */
        _clickHandler : function _clickHandler() {
            if (this.entity.saved) {
                // wants to unsave? you need to confirm first.
                this.parent.addIsHoverState();
                this.unsavePopover.activate();
                return void 0;
            }

            this._saveHandler();
        },

        /* Sets the button state as saved plus calling the API to save the post.
         * @method _saveHandler <private>
         */
        _saveHandler : function _saveHandler() {
            this.entity.totalSaves++;
            this.parent.updateSaves(this.entity);
            this._setIsSaved()._cancelHoverState();

            API.postSave({
                profileName : this.entity.voice.owner.profileName,
                voiceSlug : this.entity.voice.slug,
                postId : this.entity.id
            }, function(err) {
                if (err) {
                    this.entity.totalSaves--;
                    this.parent.updateSaves(this.entity);
                    this._setIsNotSaved();
                }
            }.bind(this));
        },

        /* Sets the button state as not saved plus calling the API to unsave.
         * @method _unsaveHandler <private>
         */
        _unsaveHandler : function _unsaveHandler() {
            this.entity.totalSaves--;
            this.parent.updateSaves(this.entity);
            this.unsavePopover.deactivate();
            this._setIsNotSaved();

            API.postUnsave({
                profileName : this.entity.voice.owner.profileName,
                voiceSlug : this.entity.voice.slug,
                postId : this.entity.id
            }, function(err) {
                if (err) {
                    this.entity.totalSaves++;
                    this.parent.updateSaves(this.entity);
                    this._setIsSaved();
                }
            }.bind(this));
        },

        _cancelHandler : function _cancelHandler() {
            this.unsavePopover.deactivate();
        },

        /* Adds a class selector that prevent the hover effect for this particular button via CSS.
         * This is important for UX, because when a user has just followed this Entity we should NOT shown the 'unfollow' state of the button on hover over.
         * When the user move the mouse out of the button this class selector is removed, so when she hover over the button again then we can show the 'unfollow' button state.
         */
        _cancelHoverState : function _cancelHoverState() {
            var _this = this;

            this.el.classList.add('cancel-hover-state');

            var mouseLeave = function mouseLeave() {
                _this.el.classList.remove('cancel-hover-state');
                Events.off(_this.el, 'mouseleave', mouseLeave);
            };

            Events.on(this.el, 'mouseleave', mouseLeave);
        },

        _deactivate : function _deactivate() {
            Widget.prototype._deactivate.call(this);
            setTimeout(function() {
                if (this.parent) {
                    this.parent.removeIsHoverState();
                }
            }.bind(this), 200);
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.off(this.el, 'click', this._clickHandlerRef);
            return null;
        }
    }
});
