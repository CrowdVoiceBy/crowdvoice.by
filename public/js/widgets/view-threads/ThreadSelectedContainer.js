var GeminiScrollbar = require('gemini-scrollbar')
  , Events = require('../../lib/events')
  , KEYCODES = require('../../lib/keycodes');

Class(CV, 'ThreadSelectedContainer').inherits(Widget).includes(CV.WidgetUtils)({
  prototype: {
    _messages: null,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this._messages = [];
      this.conversationPartnerName = this.el.querySelector('.selected-thread-element__header__conversation-title');
      this.messagesContainer = this.el.querySelector('.messages-container-list__inner');
      this.deleteThreadButton = this.el.querySelector('.delete-thread');
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.appendChild(new CV.Loading({
        name: 'loader'
      })).center().disable().render(this.el);

      this.scrollbar = new GeminiScrollbar({
        element: this.el.querySelector('.selected-thread-element__messages-list-scroll'),
        createElements: false,
        autoshow: true
      }).create();

      this.appendChild(new CV.PopoverConfirm({
        name: 'confirmPopover',
        data: {
          confirm : {
            label: 'Delete Conversation',
            className: '-color-negative'
          }
        }
      }));

      this.appendChild(new CV.PopoverBlocker({
        name: 'popover',
        className: 'delete-thread-popover -text-left -nw',
        placement: 'bottom-right',
        content: this.confirmPopover.el
      }));

      this.appendChild(new CV.UI.InputButton({
        name: 'replyButton',
        className: '-m0',
        inputData: {
          inputClassName: '-block -btrr0 -bbrr0',
          attr: {
            placeholder: 'Message...'
          }
        },
        buttonData: {
          value: 'Reply',
          className: 'primary small'
        },
      })).render(this.el.querySelector('.selected-thread-element__footer'));

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._deleteThreadRef = this._deleteThread.bind(this);
      Events.on(this.deleteThreadButton, 'click', this._deleteThreadRef);

      this._popOverConfirmClickHandlerRef = this._popOverConfirmClickHandler.bind(this);
      this.confirmPopover.bind('confirm', this._popOverConfirmClickHandlerRef);

      this._popOverCancelClickHandlerRef = this._popOverCancelClickHandler.bind(this);
      this.confirmPopover.bind('cancel', this._popOverCancelClickHandlerRef);

      Events.on(this.replyButton.button.el, 'click', this._sendMessageHandler.bind(this));
      Events.on(this.replyButton.input.el, 'keyup', this._messageInputKeyUpHandler.bind(this));

      this._scrollHandlerRef = this._scrollHandler.bind(this);
      Events.on(this.scrollbar.getViewElement(), 'scroll', this._scrollHandlerRef);
    },

    _scrollHandler: function _scrollHandler(ev) {
      if (ev.target.scrollTop === 0) {
        this.parent.dispatch('requestThreadMessages');
      }
    },

    _deleteThread: function _deleteThread(ev) {
      ev.stopPropagation();
      this.popover.render(ev.currentTarget).activate();
    },

    /* Handles the popover 'cancel' custom event.
     * Just close the popover.
     */
    _popOverCancelClickHandler: function _popOverCancelClickHandler(ev) {
      ev.stopPropagation();
      this.popover.deactivate();
    },

    /* Handles the popover 'confirm' custom event.
     */
    _popOverConfirmClickHandler: function _popOverConfirmClickHandler(ev) {
      ev.stopPropagation();
      this.popover.deactivate();
      this.parent.dispatch('deleteThread');
    },

    showLoader: function showLoader() {
      this.loader.enable();
    },

    hideLoader: function hideLoader() {
      this.loader.disable();
    },

    clearMessages: function clearMessages() {
      var messagesLength = this._messages.length;
      while(messagesLength > 0) {
        this._messages[0].destroy();
        if (this._messages.length === messagesLength) {
          this._messages.shift();
        }
        messagesLength--;
      }
      this._messages = [];
      return this;
    },

    showDeleteThreadButton: function showDeleteThreadButton() {
      this.dom.removeClass(this.deleteThreadButton, ['-hide']);
      return this;
    },

    hideDeleteThreadButton: function hideDeleteThreadButton() {
      this.dom.addClass(this.deleteThreadButton, ['-hide']);
      return this;
    },

    /* Reply input keyup handler.
     * Checks if the pressed key is ENTER, if so it will call the send
     * message handler, otherwise it will do nothing.
     */
    _messageInputKeyUpHandler: function _messageInputKeyUpHandler(ev) {
      var charCode = (typeof ev.which === 'number') ? ev.which : ev.keyCode;
      if (charCode === KEYCODES.ENTER) {
        this._sendMessageHandler();
      }
    },

    /* Tries to send a new message.
     * Disables the reply button, if the input has text on in it will send
     * it to the current thread or if no thread is currently selected it
     * will create a new thread, otherwise it will just re-enable the
     * reply button.
     */
    _sendMessageHandler: function _sendMessageHandler() {
      if (this.disabled === true) return;

      var message = this.replyButton.input.getValue();

      this.disable();

      if (!message.trim()) {
        return this.enable();
      }

      this.replyButton.input.setValue('');

      this.parent.dispatch('newMessage',  {
        message: message
      });
    },

    appendMessages: function appendMessages(messages, thread) {
      this.messagesContainer.appendChild(this._getMessagesFragment(messages, thread));
      this.scrollbar.update().getViewElement().scrollTop = this.scrollbar.getViewElement().scrollHeight;
      return this;
    },

    prependMessages: function prependMessages(messages, thread) {
      var firstChild = this.messagesContainer.firstChild;
      this.messagesContainer.insertBefore(this._getMessagesFragment(messages, thread), firstChild);
      this.scrollbar.update().getViewElement().scrollTop = firstChild.offsetTop;
      return this;
    },

    focus: function focus() {
      this.replyButton.input.getInput().focus();
      return this;
    },

    updateConversationTitle: function updateConversationTitle(partnerName) {
      this.dom.updateText(this.conversationPartnerName, 'Conversation with ' + partnerName);
      return this;
    },

    _getMessagesFragment: function _getMessagesFragment(messages, thread) {
      var fragment = document.createDocumentFragment();
      messages.map(function (message) {
        var msg = this.appendChild(new CV.Message({
          name: 'message_' + message.id,
          type: message.type,
          data: message,
          thread: thread
        })).setup().render(fragment);
        this._messages.push(msg);
      }, this);
      return fragment;
    },

    _disable: function _disable() {
      Widget.prototype._disable.call(this);
      this.replyButton.button.disable();
    },

    _enable: function _enable() {
      Widget.prototype._enable.call(this);
      this.replyButton.button.enable();
      this.replyButton.input.enable();
    }
  }
});
