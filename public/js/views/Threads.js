var _ = require('underscore')
  , Person = require('../lib/currentPerson')
  , API = require('../lib/api')
  , ThreadsStore = require('../stores/ThreadsStore')
  , NotificationsStore = require('../stores/NotificationsStore');

Class(CV.Views, 'Threads').includes(NodeSupport, CV.WidgetUtils)({
  EMPTY_STATE_CLASSNAME: '-is-empty-state',
  prototype: {
    _activeThreadId: null,
    _senderEntityId: null,
    _receiverEntityId: null,

    init: function init(config) {
      Object.keys(config || {}).forEach(function(propertyName) {
        this[propertyName] = config[propertyName];
      }, this);
      this._setup()._bindEvents();
    },

    /* Checks if the location.hash matched any existing thread, if so it will
     * auto-activate that thead.
     * @public
     */
    setup: function setup() {
      var threadHash = window.location.hash.substr(1);
      if (threadHash) {
        if (this.sidebarUIContainer.getThreadById(threadHash)) {
          this._activateThread(threadHash);
          this.sidebarUIContainer.scrollTo(this._activeThreadId);
        }
      }
      return this;
    },

    /* Add childrens and check if the are no current threads, in which case the
     * empty state is displayed.
     */
    _setup: function _setup() {
      this.appendChild(new CV.ThreadsSidebarUIContainer({
        name: 'sidebarUIContainer',
        el: this.sidebarUIContainer,
        data: {threads: this.threads}
      }));

      this.appendChild(new CV.ThreadMainUIContainer({
        name: 'mainUIContainer',
        el: this.mainUIContainer
      }));

      if (!this.threads.length) {
        this._showEmptyState();
      }

      return this;
    },

    /* Subscribe to widgets and stores events.
     */
    _bindEvents: function _bindEvents() {
      this._gotThreadMessagesHandlerRef = this._gotThreadMessagesHandler.bind(this);
      ThreadsStore.bind('threadsStore:gotThreadMessages', this._gotThreadMessagesHandlerRef);

      this._requestedThreadMessagesHandlerRef = this._requestedThreadMessagesHandler.bind(this);
      ThreadsStore.bind('threadsStore:requestedThreadMessages', this._requestedThreadMessagesHandlerRef);

      this._gotNewNotificationsHandlerRef = this._gotNewNotificationsHandler.bind(this);
      NotificationsStore.bind('newNotifications', this._gotNewNotificationsHandlerRef);

      this._composeMessageSetSenderHandlerRef = this._composeMessageSetSenderHandler.bind(this);
      this.sidebarUIContainer.bind('composeMessageSetSender', this._composeMessageSetSenderHandlerRef);
      this.mainUIContainer.bind('composeMessageSetSender', this._composeMessageSetSenderHandlerRef);

      this._composeMessageSetReceiverHandlerRef = this._composeMessageSetReceiverHandler.bind(this);
      this.mainUIContainer.bind('composeMessageSetReceiver', this._composeMessageSetReceiverHandlerRef);

      this._newMessageHandlerRef = this._newMessageHandler.bind(this);
      this.mainUIContainer.bind('newMessage', this._newMessageHandlerRef);

      this._threadSidebarClickHandlerRef = this._threadSidebarClickHandler.bind(this);
      CV.ThreadSidebarItem.bind('sidebarItem:click', this._threadSidebarClickHandlerRef);

      this._deleteThreadRef = this._deleteThread.bind(this);
      this.mainUIContainer.bind('deleteThread', this._deleteThreadRef);

      this._requestPreviousMessagesFromThreadHandlerRef = this._requestPreviousMessagesFromThreadHandler.bind(this);
      this.mainUIContainer.bind('requestThreadMessages', this._requestPreviousMessagesFromThreadHandlerRef);
    },

    /* Temporal NotificationsStore handler to provide a “real-chat” experience
     * for simple message types. This does not handle when new invitations
     * arrive (invitation_voice, invitation_organization).
     * This also needs the user to have the web notification
     * “When I receive a new message” enabled.
     */
    _gotNewNotificationsHandler: function _gotThreadMessagesHandler(res) {
      var threads = res.notifications.filter(function (n) {
        return (n.action.itemType === 'message');
      }).map(function (n) {
        return n.action.thread;
      });

      _.unique(threads, 'id').map(function (thread) {
        var _threadInstanceFound = this.sidebarUIContainer.getThreadById(thread.id)
          , lastMessage = thread.messages[0];

        if (!_threadInstanceFound) {
          // thread not found, add a new thread
          ThreadsStore.addThread(thread.id, thread);

          return this._addThread(thread, true)
            ._getThreadById(thread.id)
            .updateLastMessage(lastMessage.message);
        }

        if (_threadInstanceFound !== this._getActiveThread()) {
          // thread found but is not active, update the counter and last message
          return _threadInstanceFound
            .updateUnreadCounter()
            .updateLastMessage(lastMessage.message);
        }

        // thread found and is the active one, add new message to the thread
        ThreadsStore.addMessage(this._activeThreadId, lastMessage);

        this.mainUIContainer
          .appendMessages([lastMessage], this._getActiveThread())
          .enableMessageInput();

        this._getThreadById(this._activeThreadId)
          .updateLastMessage(lastMessage.message)
          .markAsRead();
      }, this);
    },

    /* ThreadsStore:gotThreadMessages handler.
     * This event is emitted when a new thread is select and its request for
     * its messages has been successful so they can be displayed.
     */
    _gotThreadMessagesHandler: function _gotThreadMessagesHandler(res) {
      if (this._activeThreadId !== res.threadId) return;

      var partnerName = this._getActiveThread().threadPartner.name;

      this.mainUIContainer
        .clearMessages()
        .updateConversationTitle(partnerName)
        .showDeleteThreadButton()
        .showSelectedThreadState()
        .appendMessages(res.messages, this._getActiveThread())
        .hideThreadLoader();
    },

    /* ThreadsStore:requestThreadMessages handler.
     * This event is emitted when a thread is scrolled up and so it asks for
     * previous messages to be displayed (pagination).
     * The returned messages will be prepended to the current thread view.
     */
    _requestedThreadMessagesHandler: function _requestedThreadMessagesHandler(res) {
      if (this._activeThreadId !== res.threadId) return;
      if (!res.messages.length) return;
      this.mainUIContainer.prependMessages(res.messages, this._getActiveThread());
    },

    /* This is step 1/2 while composing a new message.
     * Sets the senderEntityId.
     */
    _composeMessageSetSenderHandler: function _composeMessageSetSenderHandler(ev) {
      this._senderEntityId = ev.entityId;
      this._setComposeNewMessageState(ev.entityId, ev.isOrganization, ev.organizationName);
    },

    /* This is step 2/2 while composing a new message.
     * Sets the receiverEntityId.
     * Checks if a thread already exists between the receiverEntityId and the
     * senderEntityId, in which case the existing thread will be activated.
     * If the thread does not exists between those entities then a new thread
     * will be created when the first message is send.
     */
    _composeMessageSetReceiverHandler: function _composeMessageSetReceiverHandler(ev) {
      this._receiverEntityId = ev.entity.id;

      var thread = this._threadExists(this._senderEntityId, this._receiverEntityId);
      if (thread) {
        this._activateThread(thread.data.id);
        return this.sidebarUIContainer.scrollTo(this._activeThreadId);
      }

      this.mainUIContainer
        .clearMessages()
        .updateConversationTitle(ev.entity.name)
        .hideDeleteThreadButton()
        .showSelectedThreadState();
    },

    /* Handles when a new message have been send.
     * If there is a current active thread then the message will be added to
     * that thread, otherwise a new thread will be created.
     */
    _newMessageHandler: function _newMessageHandler(ev) {
      if (this._activeThreadId) {
        return this._postMessage(this._activeThreadId, ev.message);
      }

      if (this._senderEntityId && this._receiverEntityId) {
        this._createThread(this._senderEntityId, this._receiverEntityId, ev.message);
      }
    },

    /* Handles when an thread item from the sidebar is clicked.
     * If the id of the thread that was clicked is different that the current
     * active thread then that thread will be activated, otherwise it will
     * do nothing.
     */
    _threadSidebarClickHandler: function _threadSidebarClickHandler(ev) {
      var id = ev.widget.data.id;
      if (this._activeThreadId === id) return;
      this._activateThread(id);
    },

    _requestPreviousMessagesFromThreadHandler: function _requestPreviousMessagesFromThreadHandler(ev) {
      ev.stopPropagation();
      ThreadsStore.requestThreadMessages(this._activeThreadId);
    },

    /* Deactivate the thread list items.
     * Display the compose message view.
     */
    _setComposeNewMessageState: function _setComposeNewMessageState(entityId, isOrganization, orgName) {
      this._deactivateThread();
      this.mainUIContainer.showNewThreadMessageState()
        .updateSenderLabel(isOrganization ? orgName : 'Myself');
    },

    _getThreadById: function _getThreadById(id) {
      return this.sidebarUIContainer.getThreadById(id);
    },

    _getActiveThread: function _getActiveThread() {
      return this._getThreadById(this._activeThreadId);
    },

    _threadExists: function _threadExists(senderEntityId, receiverEntityId) {
      return this.sidebarUIContainer.getThreadBySenderAndReceiverIds(senderEntityId, receiverEntityId);
    },

    _showEmptyState: function _showEmptyState() {
      this.dom.addClass(this.el, [this.constructor.EMPTY_STATE_CLASSNAME]);
      this.mainUIContainer.showEmptyState();
    },

    _activateThread: function _activateThread(id) {
      if (this._activeThreadId) {
        this._getThreadById(this._activeThreadId).deactivate();
      }

      this._activeThreadId = id;
      window.location.hash = id;
      this._getThreadById(this._activeThreadId).activate();
      this.mainUIContainer.showThreadLoader().clearMessages();
      ThreadsStore.getThreadMessages(id);
      return this;
    },

    _deactivateThread: function _deactivateThread() {
      if (this._activeThreadId) {
        this._getThreadById(this._activeThreadId).deactivate();
      }
      this._activeThreadId = null;
      window.location.hash = '';
      return this;
    },

    _addThread: function _addThread(threadData, prepend) {
      this.dom.removeClass(this.el, [this.constructor.EMPTY_STATE_CLASSNAME]);
      this.sidebarUIContainer.addThread(threadData, prepend);
      return this;
    },

    _deleteThread: function _deleteThread() {
      var threadId = this._activeThreadId;

      if (!this._activeThreadId) return;

      this._deactivateThread();
      this.sidebarUIContainer.deleteThread(threadId);

      if (this.sidebarUIContainer.hasThreads()) {
        this.mainUIContainer.showDefaultThreadState();
      } else {
        this._showEmptyState();
      }

      API.deleteThread({
        profileName: Person.get('profileName'),
        threadId: threadId
      }, function () {});
    },

    /* Adds a message to an existing thread.
     * @param {string} threadId
     * @param {string} message
     */
    _postMessage: function _postMessage(threadId, message) {
      if (!message || !threadId) {
        console.warn('message and threadId is required.');
        return this.mainUIContainer.enableMessageInput();
      }

      API.sendMessageToThread({
        profileName: Person.get('profileName'),
        threadId: threadId,
        data : {message: message}
      }, function(err, res) {
        if (err) return console.log(res);

        var threadInstance = this._getThreadById(threadId);
        ThreadsStore.addMessage(threadId, res);
        threadInstance.updateLastMessage(res.message);
        this.mainUIContainer.appendMessages([res], threadInstance)
          .enableMessageInput();
      }.bind(this));
    },

    /* Creates a new thread via a message between to entities.
     * @param {string} senderEntityId
     * @param {string} receiverEntityId
     * @param {string} message
     */
    _createThread: function _createThread(senderEntityId, receiverEntityId, message) {
      if (!senderEntityId || !receiverEntityId || !message) {
        console.warn('cannot create a new thread, params missing.');
        return this.mainUIContainer.enableMessageInput();
      }

      this._activeThreadId = null;
      this._senderEntityId = null;
      this._receiverEntityId = null;

      API.sendMessage({
        profileName: Person.get('profileName'),
        data: {
          type: 'message',
          senderEntityId: senderEntityId,
          receiverEntityId: receiverEntityId,
          message: message
        }
      }, function (err, res) {
        if (err) return console.log(err);
        this._addThread(res, true);
        ThreadsStore.addThread(res.id, res);
        this._activateThread(res.id);
        this.mainUIContainer.enableMessageInput();
        this._getActiveThread().updateLastMessage(res.messages[0].message);
      }.bind(this));
    }
  }
});
