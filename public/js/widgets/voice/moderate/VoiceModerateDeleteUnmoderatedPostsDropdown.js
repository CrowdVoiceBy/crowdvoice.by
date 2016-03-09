/* globals App */
var API = require('./../../../lib/api');
var moment = require('moment');

Class(CV, 'VoiceModerateDeleteUnmoderatedPostsDropdown').inherits(Widget)({
    prototype : {
        scrollableArea : null,

        olderThanDates : [
            {label: '+3 years', name: '3y', subtract: [3, 'years']},
            {label: '2 years',  name: '2y', subtract: [2, 'years']},
            {label: '1 year',   name: '1y', subtract: [1, 'years']},
            {label: '6 months', name: '6m', subtract: [6, 'months']},
            {label: '3 months', name: '3m', subtract: [3, 'months']},
            {label: '1 month',  name: '1m', subtract: [1, 'months']},
            {label: '1 week',   name: '1w', subtract: [1, 'weeks']}
        ],

        _options : null,
        _errorAlert : null,
        _successAlert : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);
            this.el = this.element[0];
            this._options = [];

            this._setup()._bindEvents();
        },

        /* Creates the dropdown and its options.
         * @return VoiceModerateDeleteUnmoderatedPostsDropdown
         */
        _setup : function _setup() {
            this.appendChild(new CV.Dropdown({
                name : 'dropdown',
                label : 'Delete unmoderated posts older than...',
                showArrow : true,
                alignment : 'top',
                className : 'ui-dropdown-styled -sm dark',
                arrowClassName : '-s10',
                bodyClassName : 'ui-vertical-list hoverable -block'
            })).render(this.el);

            this.olderThanDates.forEach(function(date) {
                this.dropdown.addContent(this.appendChild(new Widget({
                    name : 'delete' + date.name,
                    className : 'ui-vertical-list-item -block'
                })).element[0]);
                this['delete' + date.name].element.text(date.label);
                this['delete' + date.name].element[0].setAttribute('data-subtract-number', date.subtract[0]);
                this['delete' + date.name].element[0].setAttribute('data-subtract-string', date.subtract[1]);
                this._options.push(this['delete' + date.name]);
            }, this);

            this.dropdown.addContent(this.appendChild(new Widget({
                name : 'deleteAll',
                className : 'moderate-dropdown-delete-all-option ui-vertical-list-item -block'
            })).element[0]);
            this.deleteAll.element.text('All unmoderated posts');
            this.deleteAll.element[0].setAttribute('data-delete-all', true);

            this.appendChild(new CV.PopoverConfirm({
                name : 'confirmPopover',
                data : {
                    confirm : {
                        label : 'Delete Posts',
                        className : '-color-negative'
                    }
                }
            }));

            this.appendChild(new CV.PopoverBlocker({
                name : 'popover',
                className : 'unfollow-popover',
                placement : 'top-left',
                content : this.confirmPopover.el
            }));

            return this;
        },

        _bindEvents : function _bindEvents() {
            this._clickHandlerRef = this._clickHandler.bind(this);
            this._options.forEach(function(option) {
                option.element.on('click', this._clickHandlerRef);
            }, this);
            this.deleteAll.element.on('click', this._clickHandlerRef);

            this._popOverConfirmClickHandlerRef = this._popOverConfirmClickHandler.bind(this);
            this.confirmPopover.bind('confirm', this._popOverConfirmClickHandlerRef);

            this._popOverCancelClickHandlerRef = this._popOverCancelClickHandler.bind(this);
            this.confirmPopover.bind('cancel', this._popOverCancelClickHandlerRef);

            return this;
        },

        /* Handles the click event on the dropdown items.
         * @method _clickHandler <private> [Function]
         * @return undefined
         */
        _clickHandler : function _clickHandler(ev) {
            ev.stopPropagation();
            this._currentOptionToExecute = ev.target;
            this.popover.render(ev.target).activate();
        },

        /* Handles the popover 'cancel' custom event.
         * Just close the popover.
         * @method _popOverCancelClickHandler <private> [Function]
         * @return undefined
         */
        _popOverCancelClickHandler : function _popOverCancelClickHandler(ev) {
            ev.stopPropagation();
            this.popover.deactivate();
        },

        /* Handles the popover 'confirm' custom event.
         * Checks which server request should be made based on this._currentOptionToExecute
         * dataset.
         * @method _popOverConfirmClickHandler <private> [Function]
         * @return undefined
         */
        _popOverConfirmClickHandler : function _popOverConfirmClickHandler(ev) {
            ev.stopPropagation();
            this.popover.deactivate();
            this.dropdown.deactivate();

            if (this._currentOptionToExecute.getAttribute('data-delete-all')) {
                return this._deleteAllRequest();
            }

            return this._deleteOlderThanRequest(this._currentOptionToExecute);
        },

        /* Deletes all unmoderated posts olther than.
         * @method _deleteOlderThanRequest <private> [Function]
         * @return undefined
         */
        _deleteOlderThanRequest : function _deleteOlderThanRequest(element) {
            var subtractNumber = ~~element.getAttribute('data-subtract-number');
            var subtractString = element.getAttribute('data-subtract-string');
            var olderThanDate = moment().subtract(subtractNumber, subtractString);

            API.deletePostsOlderThan({
                profileName : App.Voice.data.owner.profileName,
                voiceSlug : App.Voice.data.slug,
                data : {olderThanDate: olderThanDate.format()}
            }, function(err, res) {
                // {status: "ok", deletedPostsCount: 115}
                if (err) {
                    this._displayErrorAlert('There was a problem trying to remove the indicated Posts.');
                    return;
                }

                if (res.status === 'ok') {
                    this._displaySuccessAlert(res.deletedPostsCount + ' Posts were deleted. The page will be refreshed in a couple of seconds.');

                    setTimeout(function() {
                        window.location.reload();
                    }, 2000);
                }
            }.bind(this));
        },

        /* Deletes all the unmoderated posts.
         * @method _deleteAllRequest <private>
         * @return undefined
         */
        _deleteAllRequest : function _deleteAllRequest() {
            API.deleteAllUnmoderatedPosts({
                profileName : App.Voice.data.owner.profileName,
                voiceSlug : App.Voice.data.slug
            }, function(err, res) {
                // {status: "ok", deletedPostsCount: 115}
                if (err) {
                    this._displayErrorAlert('There was a problem trying to remove the indicated Posts.');
                    return;
                }

                if (res.status === 'ok') {
                    this._displaySuccessAlert(res.deletedPostsCount + ' Posts were deleted. The page will be refreshed in a couple of seconds.');

                    setTimeout(function() {
                        window.location.reload();
                    }, 2000);
                }
            }.bind(this));
        },

        /* Displays a success alert, if already exists it will update the message.
         * @method _displaySuccessAlert <private> [Function]
         * @argument message <required> [String] the message to display.
         * @return undefined
         */
        _displaySuccessAlert : function _displaySuccessAlert(message) {
            this.scrollableArea.scrollTop = 0;

            if (this._successAlert) {
                return this._successAlert.update({
                    text: message,
                    type : 'positive'
                }).shake();
            }

            this.appendChild(new CV.Alert({
                name : '_successAlert',
                type : 'positive',
                text : message,
                className : '-mt1 -mr1 -ml1'
            })).render(this.scrollableArea, this.scrollableArea.firstElementChild);
        },

        /* Displays an error alert, if already exists it will update the message.
         * @method _displayErrorAlert <private> [Function]
         * @argument message <required> [String] the message to display.
         * @return undefined
         */
        _displayErrorAlert : function _displayErrorAlert(message) {
            this.scrollableArea.scrollTop = 0;

            if (this._errorAlert) {
                return this._errorAlert.update({
                    text: message,
                    type : 'negative'
                });
            }

            this.appendChild(new CV.Alert({
                name : '_errorAlert',
                type : 'negative',
                text : message,
                className : '-mt1 -mr1 -ml1'
            })).render(this.scrollableArea, this.scrollableArea.firstElementChild);
        },

        destroy : function destroy() {
            this._options.forEach(function(option) {
                option.element.off('click', this._clickHandlerRef);
            }, this);
            this.deleteAll.element.off('click', this._clickHandlerRef);
            this._clickHandlerRef = null;

            Widget.prototype.destroy.call(this);
            return null;
        }
    }
});
