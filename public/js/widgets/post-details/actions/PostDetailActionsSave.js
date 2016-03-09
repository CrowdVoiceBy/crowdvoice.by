/* Handles the save/unsave post actions for PostDetails.
 * update(entity) => updates the button using the EntityData passed as param
 */
var API = require('./../../../lib/api');
var Events = require('./../../../lib/events');

Class(CV, 'PostDetailActionsSave').inherits(Widget).includes(CV.WidgetUtils)({
    ELEMENT_CLASS : 'post-detail-action-item cv-button tiny',
    HTML : '<button></button>',

    HTML_SAVE : '\
        <svg class="-s14">\
            <use xlink:href="#svg-save"></use>\
        </svg>\
        <span class="post-card-actions-label">Save</span>',

    HTML_SAVED : '\
        <div class="saved-button -color-positive">\
            <svg class="-s14">\
                <use xlink:href="#svg-saved-posts"></use>\
            </svg>\
            <span class="post-card-actions-label">Saved</span>\
        </div>\
        <div class="unsave-button -color-negative">\
            <svg class="-s14">\
                <use xlink:href="#svg-save-outline"></use>\
            </svg>\
            <span class="post-card-actions-label">Unsave</span>\
        </div>',

    prototype : {
        /* PostEntity data */
        data : null,
        tooltipPostition : 'top',

        init : function init (config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._bindEvents();
        },

        update : function update(data) {
            this.data = data;

            if (data.saved) {
                this._setIsSaved();
            } else {
                this._setIsNotSaved();
            }
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
            this.data.saved = true;

            this.el.innerHTML = '';
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_SAVED);

            this.appendChild(new CV.PopoverUnsave({
                name : 'unsavePopoverContent'
            }));

            this.appendChild(new CV.PopoverBlocker({
                name : 'unsavePopover',
                className : 'unfollow-popover',
                placement : this.tooltipPostition,
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
            this.data.saved = false;

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
            if (this.data.saved) {
                // wants to unsave? you need to confirm first.
                this.unsavePopover.activate();
                return;
            }

            this._saveHandler();
        },

        /* Sets the button state as saved plus calling the API to save the post.
         * @method _saveHandler <private>
         */
        _saveHandler : function _saveHandler() {
            this.data.totalSaves++;
            this.parent.updateSaves(this.data);
            this._setIsSaved()._cancelHoverState();

            API.postSave({
                profileName : this.data.voice.owner.profileName,
                voiceSlug : this.data.voice.slug,
                postId : this.data.id
            }, function(err) {
                if (err) {
                    this.data.totalSaves--;
                    this.parent.updateSaves(this.data);
                    this._setIsNotSaved();
                }
            }.bind(this));
        },


        /* Sets the button state as not saved plus calling the API to unsave.
         * @method _unsaveHandler <private>
         */
        _unsaveHandler : function _unsaveHandler() {
            this.data.totalSaves--;
            this.parent.updateSaves(this.data);
            this._setIsNotSaved();

            API.postUnsave({
                profileName : this.data.voice.owner.profileName,
                voiceSlug : this.data.voice.slug,
                postId : this.data.id
            }, function(err) {
                if (err) {
                    this.data.totalSaves++;
                    this.parent.updateSaves(this.data);
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

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);
            Events.off(this.el, 'click', this._clickHandlerRef);
            return null;
        }
    }
});

