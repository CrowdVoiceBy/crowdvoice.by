var Person = require('../../lib/currentPerson')
  , Events = require('../../lib/events');

Class(CV, 'ThreadMainUIContainer').inherits(Widget).includes(CV.WidgetUtils)({
  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.emptyThreadsElement = this.el.querySelector('.empty-threads-element');
      this.defaultThreadsElement = this.el.querySelector('.default-thread-element');
      this.newThreadMessageElement = this.el.querySelector('.new-thread-message-element');
      this.selectedThreadElement = this.el.querySelector('.selected-thread-element');
      this._setup()._bindEvents();
    },

    _setup: function _setup()  {
      this.appendChild(new CV.ThreadNewContainer({
        name: 'threadNewContainer',
        el: this.newThreadMessageElement
      }));

      this.appendChild(new CV.ThreadSelectedContainer({
        name: 'threadSelectedContainer',
        el: this.selectedThreadElement
      }));

      return this;
    },

    _bindEvents: function _bindEvents() {
      Events.on(this.emptyThreadsElement.querySelector('.js-empty-threads-new-message'), 'click', function (ev) {
        ev.preventDefault();
        this.dispatch('composeMessageSetSender', {
          entityId: Person.get('id')
        });
      }.bind(this));
    },

    showEmptyState: function showEmptyState() {
      this.dom.removeClass(this.emptyThreadsElement, ['-hide']);
      this._hideElements([this.defaultThreadsElement, this.newThreadMessageElement, this.selectedThreadElement]);
    },

    showDefaultThreadState: function showDefaultThreadState() {
      this.dom.removeClass(this.defaultThreadsElement, ['-hide']);
      this._hideElements([this.emptyThreadsElement, this.newThreadMessageElement, this.selectedThreadElement]);
      return this;
    },

    showNewThreadMessageState: function showNewThreadMessageState() {
      this.dom.removeClass(this.newThreadMessageElement, ['-hide']);
      this._hideElements([this.emptyThreadsElement, this.defaultThreadsElement, this.selectedThreadElement]);
      this.threadNewContainer.focus();
      return this;
    },

    showSelectedThreadState: function showSelectedThreadState() {
      this.dom.removeClass(this.selectedThreadElement, ['-hide']);
      this._hideElements([this.emptyThreadsElement, this.defaultThreadsElement, this.newThreadMessageElement]);
      this.threadSelectedContainer.focus();
      return this;
    },

    _hideElements: function _hideElements(elements) {
      elements.map(function (el) {
        this.dom.addClass(el, ['-hide']);
      }, this);
    },

    showThreadLoader: function showThreadLoader() {
      this.threadSelectedContainer.showLoader();
      return this;
    },

    hideThreadLoader: function hideThreadLoader() {
      this.threadSelectedContainer.hideLoader();
      return this;
    },

    clearMessages: function clearMessages() {
      this.threadSelectedContainer.clearMessages();
      return this;
    },

    appendMessages: function appendMessages(messages, thread) {
      this.threadSelectedContainer.appendMessages(messages, thread);
      return this;
    },

    prependMessages: function prependMessages(messages, thread) {
      this.threadSelectedContainer.prependMessages(messages, thread);
      return this;
    },

    updateConversationTitle: function updateConversationTitle(partnerName) {
      this.threadSelectedContainer.updateConversationTitle(partnerName);
      return this;
    },

    enableMessageInput: function enableMessageInput() {
      this.threadSelectedContainer.enable().focus();
      return this;
    },

    showDeleteThreadButton: function showDeleteThreadButton() {
      this.threadSelectedContainer.showDeleteThreadButton();
      return this;
    },

    hideDeleteThreadButton: function hideDeleteThreadButton() {
      this.threadSelectedContainer.hideDeleteThreadButton();
      return this;
    },

    updateSenderLabel: function updateSenderLabel(label) {
      this.threadNewContainer.updateSenderLabel(label);
      return this;
    }
  }
});
