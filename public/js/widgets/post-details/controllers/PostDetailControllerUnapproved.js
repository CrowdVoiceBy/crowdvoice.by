/* globals App */
Class(CV, 'PostDetailControllerUnapproved').includes(CV.PostDetailController)({
    prototype : {
        registry : CV.ModeratePostsRegistry,

        init : function init(config) {
            CV.PostDetailController.prototype.init.call(this, config);
            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            CV.PostDetailController.prototype._bindEvents.call(this);
            this.socket.on('unApprovedPostsPage', this.updateRegistryRef);
        },

        /* Requests the next and prev months data to the socket.
         * @method _requestSiblings <protected> [function]
         */
        _requestSiblings : function _requestSiblings(monthIndex) {
            var prevMonthString = this.keys[monthIndex - 1];
            var nextMonthString = this.keys[monthIndex + 1];
            var prev, next;

            if (prevMonthString) {
                prev = this.registry.get(prevMonthString);
                if (!prev) {
                    this.socket.emit('getUnApprovedPostsPage', App.Voice.data.id, prevMonthString);
                } else {
                    this.updateValues(this.keys.indexOf(prevMonthString), prev);
                }
            }

            if (nextMonthString) {
                next = this.registry.get(nextMonthString);
                if (!next) {
                    this.socket.emit('getUnApprovedPostsPage', App.Voice.data.id, nextMonthString);
                } else {
                    this.updateValues(this.keys.indexOf(nextMonthString), next);
                }
            }

            return this;
        },

        destroy : function destroy() {
            this.widget = this.widget.destroy();
            this.socket.removeListener('unApprovedPostsPage', this.updateRegistryRef);
            return null;
        }
    }
});
