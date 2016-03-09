/* Handles the Threads data fetching, emit events letting its subscribers
 * to know when the data was received.
 * It keeps the data of the Threads and its Messages.
 */
var API = require('./../lib/api')
  , Person = require('./../lib/currentPerson');

module.exports = Class(CV.Store, 'Threads').includes(CustomEventSupport)({
  _threads: {},
  _messagesLimit: 15,

  getThreads: function getThreads() {
    API.getThreads({
      profileName: Person.get('profileName')
    }, function (err, res) {
      this.dispatch('threadStore:gotThreads', {threads: res});
    });
  },

  getThreadMessages: function getThreadMessages(threadId) {
    // var _cachedThread = this._threads[threadId];
    // if (_cachedThread) {
    //   return this.dispatch('threadsStore:gotThreadMessages', {
    //     threadId: threadId,
    //     messages: _cachedThread.messages,
    //     totalCount: _cachedThread.totalCount
    //   });
    // }

    API.getThreadMessages({
      profileName: Person.get('profileName'),
      threadId: threadId,
      data: { limit: this._messagesLimit }
    }, function (err, res) {
      this._threads[threadId] = res;
      this._threads[threadId].totalRequests = 1;

      this.dispatch('threadsStore:gotThreadMessages', {
        threadId: threadId,
        messages: res.messages,
        totalCount: res.totalCount
      });
    }.bind(this));
  },

  requestThreadMessages: function requestThreadMessages(threadId) {
    var thread = this._threads[threadId]
      , offset = this._messagesLimit;

    if (!thread) return;

    offset = (thread.totalRequests * this._messagesLimit) + (thread.newMessagesCount || 0);
    if (offset >= thread.totalCount) return;

    API.getThreadMessages({
      profileName: Person.get('profileName'),
      threadId: threadId,
      data: {
        limit: this._messagesLimit,
        offset: offset
      }
    }, function (err, res) {
      thread.messages = res.messages.concat(thread.messages);
      thread.totalRequests++;

      this.dispatch('threadsStore:requestedThreadMessages', {
        threadId: threadId,
        messages: res.messages,
        totalCount: res.totalCount
      });
    }.bind(this));
  },

  /* Register a new thread with a initial message on the store.
   * @public
   */
  addThread: function addThread(threadId, res) {
    this._threads[threadId] = res;
    this._threads[threadId].totalRequests = 1;

    this.dispatch('threadsStore:gotThreadMessages', {
      threadId: threadId,
      messages: res.messages,
      totalCount: res.totalCount
    });
  },

  addMessage: function addMessage(threadId, message) {
    var _cachedThread = this._threads[threadId];
    if (!_cachedThread) {
      console.log('Thread not found on ThreadsStore');
      return;
    }
    _cachedThread.messages.push(message);
    _cachedThread.totalCount++;
    if (_cachedThread.newMessagesCount) {
      _cachedThread.newMessagesCount++;
    } else {
      _cachedThread.newMessagesCount = 1;
    }
  }
});
