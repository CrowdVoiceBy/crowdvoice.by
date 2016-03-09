var GeminiScrollbar = require('gemini-scrollbar')
  , Person = require('../../lib/currentPerson')
  , Events = require('../../lib/events');

Class(CV, 'ThreadsSidebarUIContainer').inherits(Widget)({
  prototype: {
    _threads: null,
    EVENT_NAME: 'composeMessageSetSender',
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this._threads = [];

      this.sidebarList = this.el.querySelector('.messages-list');
      this.sidebarListInner = this.el.querySelector('.messages-list__inner');
      this.$sidebarListInner = $(this.sidebarListInner);
      this.scrollbar = new GeminiScrollbar({
        element: this.sidebarList,
        createElements: false,
        autoshow: true
      }).create();

      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      var threads = this.data.threads;
      if (threads.length > 0) {
        threads.sort(function(a, b) {
          if (a.createdAt < b.createdAt) return 1;
          if (a.createdAt > b.createdAt) return -1;
          return 0;
        }).forEach(function(thread) {
          this.addThread(thread);
        }, this);
      }

      this.appendChild(new CV.Input({
        name: 'searchField',
        type: 'search',
        style: 'small',
        placeholder: 'Search conversations'
      })).render(this.el.querySelector('.messages-search'));

      if (Person.ownsOrganizations()) {
        this.appendChild(new CV.UI.NewMessageDropdown({
          name: 'newMessageDropdown'
        })).render(this.el.querySelector('.messages-new'));
      } else {
        this.appendChild(new CV.UI.Button({
          name: 'newMessageButton',
          className: 'small messages-sidebar-header__new-conversation-btn',
        })).render(this.el.querySelector('.messages-new')).updateHTML('<svg class="-color-primary -s16"><use xlink:href="#svg-new-message"></use></svg>');
      }

      return this;
    },

    _bindEvents: function _bindEvents() {
      this._searchFieldHandlerRef = this._searchFieldHandler.bind(this);
      this.searchField.element.find('input').on('keyup', this._searchFieldHandlerRef);

      if (this.newMessageButton) {
        this._newMessageButtonClickHandlerRef = this._newMessageButtonClickHandler.bind(this);
        Events.on(this.newMessageButton.el, 'click', this._newMessageButtonClickHandlerRef);
      }

      if (this.newMessageDropdown) {
        this._newMessageDropdownChangeHandlerRef = this._newMessageDropdownChangeHandler.bind(this);
        this.newMessageDropdown.bind('changed', this._newMessageDropdownChangeHandlerRef);
      }
    },

    /* Register a new thread and renders it.
     * @public
     * @param {Object} threadData The threadPresenterData
     * @param {boolean[false} prepend Prepend the item to the sidebarList
     */
    addThread: function addThread(threadData, prepend) {
      var thread = new CV.ThreadSidebarItem({
        name: 'thread_' + threadData.id,
        data: threadData
      });
      this._threads.push(thread);
      this.appendChild(thread);
      thread.render(this.sidebarListInner, prepend && this.sidebarListInner.firstChild);
      this.scrollbar.update();
      return this;
    },

    deleteThread: function deleteThread(id) {
      var thread = this.getThreadById(id);
      if (thread) {
        var index = this._threads.indexOf(thread);
        this._threads.splice(index, 1);
        thread.destroy();
        this.scrollbar.update();
      }
    },

    hasThreads: function hasThreads() {
      return this._threads.length;
    },

    scrollTo: function scrollTo(id) {
      var thread = this.getThreadById(id);
      if (!thread) return;
      var el = thread.element[0];
      this.scrollbar.getViewElement().scrollTop = el.offsetTop - el.parentElement.offsetTop - 20;
    },

    /* Search threads by id, if found a match it will return the matched
     * thread, otherwise returns undefined.
     * @public
     * @return {Object|undefined}
     */
    getThreadById: function getThreadById(threadId) {
      var thread;
      this._threads.some(function (t) {
        if (t.data.id === threadId) {
          thread = t;
          return true;
        }
      });
      return thread;
    },

    /* Search threads by senderEntityId and receiverEntityId, if found a match
     * it will return the matched thread, otherwise returns undefined.
     * @public
     * @return {Object|undefined}
     */
    getThreadBySenderAndReceiverIds: function getThreadBySenderAndReceiverIds(senderEntityId, receiverEntityId) {
      var thread;
      this._threads.some(function (t) {
        var sender = t.data.senderEntity.id
          , receiver = t.data.receiverEntity.id;
        if ((sender === senderEntityId && receiver === receiverEntityId) ||
            (receiver === senderEntityId && sender === receiverEntityId)) {
          thread = t;
          return true;
        }
      });
      return thread;
    },

    _searchFieldHandler: function _searchFieldHandler(ev) {
      var searchStr = ev.target.value.toLowerCase();
      this.$sidebarListInner.find('.thread-list-item').each(function() {
        var _this = $(this)
          , userStr = _this.text().toLowerCase();
        if (userStr.indexOf(searchStr) >= 0){
          _this.show();
        } else {
          _this.hide();
        }
      });
      this.scrollbar.update();
    },

    _newMessageButtonClickHandler: function _newMessageButtonClickHandler() {
      this.dispatch(this.EVENT_NAME, {entityId: Person.get('id')});
    },

    _newMessageDropdownChangeHandler: function _newMessageDropdownChangeHandler(ev) {
      ev.stopPropagation();
      if (ev.data.dataset.isOrganization === "true") {
        return this.dispatch(this.EVENT_NAME, {
          entityId: ev.data.dataset.value,
          isOrganization: true,
          organizationName: ev.data.textContent
        });
      }
      this.dispatch(this.EVENT_NAME, {entityId: ev.data.dataset.value});
    }
  }
});
