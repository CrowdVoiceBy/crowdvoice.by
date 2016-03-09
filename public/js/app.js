/* socketStart() => starts the socketio connection
 * getSocket() => returns the socketio instance
 * addInteractiveSidebar() => made the Sidebar listen to mouse events to show/hide itself
 */
/* global io */
var Person = require('./lib/currentPerson')
  , Topics = require('./lib/registers/Topics');

Class(CV, 'App').includes(NodeSupport)({
  _socket: null,

  /* Start socketio connection.
   * @static
   * @return CV.App [Object]
   */
  socketStart: function socketStart() {
    if (!this._socket) {
      this._socket = io(window.location.origin, {
        'reconnection': true,
        'reconnectionDelay': 1000,
        'reconnectionDelayMax': 5000,
        'reconnectionAttempts': 5
      });
    }
    return this;
  },

  /* Return the socketio instance.
   * @static
   * @return {Object} this._socket
   */
  getSocket: function getSocket() {
    if (this._socket) {
      return this._socket;
    }

    this.socketStart();
    return this.getSocket();
  },

  prototype: {
    _scrollableElement: null,

    /* Updates currentPerson Registry
     * Fetch Topics and updates the Topics Registry
     * Starts the Header widget so it can update itself
     * Starts the Sidebar window so it can update itself
     */
    init: function init(config) {
      Object.keys(config || {}).forEach(function (propertyName) {
        this[propertyName] = config[propertyName];
      }, this);

      Person.set(window.currentPerson);
      Topics.fetch();

      this._scrollableElement = document.body;
    },

    setup: function setup() {
      if (Person.get()) {
        this.appendChild(new CV.NotificationsManager({
          name: 'notificationsManager'
        })).render(document.body.querySelector('.app-wrapper'));
        this.tabCounter = new CV.TabCounter();
      }
      window.CardHoverWidget = new CV.CardHover().render(document.body);

      this.appendChild(new CV.Header({
        name: 'header',
        element: $('.cv-main-header')
      })).setup();

      this.appendChild( new CV.Sidebar({
        name: 'sidebar',
        element: document.getElementsByClassName('cv-main-sidebar')[0]
      }));

      return this;
    },

    /* Start socketio connection.
     * @public
     * @return CV.App [Object]
     */
    socketStart: function socketStart() {
      this.constructor.socketStart();
      return this;
    },

    /* Return the socketio instance.
     * @public>
     * @return {Object} this._socket
     */
    getSocket: function getSocket() {
      return this.constructor.getSocket();
    },

    /* Make the sidebar interactive, expand on :hover.
     * @public
     * @return {Object} App
     */
    addInteractiveSidebar: function addInteractiveSidebar() {
      this.sidebar.enableInteraction();
      this.sidebar.setup();
      return this;
    },

    /* Returns the scrollable element for the main content.
     * This method can be useful to get properties or run methods for the
     * scrollable area. ex. scrollTop = 0, after showing an alert message.
     * @public
     */
    getScrollableElement: function getScrollableElement() {
      return this._scrollableElement;
    },

    /* Sets the app scrollble element y position.
     * @public
     * @param {number} y - the y scroll position.
     */
    scrollTo: function scrollTo(y) {
      this.getScrollableElement().scrollTop = y;
    },

    _bodyOverflowValuesIndex: -1,
    _bodyOverflowValues: [],

    hideScrollbar: function hideScrollbar() {
      this._bodyOverflowValues.push(this.getBodyOverflowValue());
      this._bodyOverflowValuesIndex++;
      this.getScrollableElement().style.overflow = 'hidden';
    },

    showScrollbar: function showScrollbar() {
      this.getScrollableElement().style.overflow = this._bodyOverflowValues[this._bodyOverflowValuesIndex];
      this._bodyOverflowValuesIndex--;
      this._bodyOverflowValues.pop();
    },

    getBodyOverflowValue: function getBodyOverflowValue() {
      return window.getComputedStyle(this.getScrollableElement(), null)
        .getPropertyValue('overflow');
    },

    /* Display the VoiceCreate Modal.
     * @public
     */
    showVoiceCreateModal: function showVoiceCreateModal(config) {
      if (!Person.get()) {
        throw new Error('Not autorized to perform this action.');
      }

      this.appendChild(new CV.UI.Modal({
        title: 'Create a Voice',
        name: 'createAVoiceModal',
        action: CV.VoiceCreate,
        width: 960,
        data: {
          ownerEntity: config.ownerEntity || Person.get()
        },
      })).render(document.body);

      requestAnimationFrame(function () {
        this.createAVoiceModal.activate();
      }.bind(this));
    },

    /* Display the VoiceEdit Modal.
     * @public
     */
    showVoiceEditModal: function showVoiceEditModal(config) {
      if (!Person.get() || !config.voiceEntity) {
        throw new Error('Not autorized to perform this action.');
      }

      this.appendChild(new CV.UI.Modal({
        title: 'Edit Voice',
        name: 'editVoiceModal',
        action: CV.VoiceEdit,
        width: 960,
        data: {
          voiceEntity: config.voiceEntity,
          ownerEntity: config.ownerEntity || Person.get()
        },
        isAdmin: config.isAdmin
      })).render(config.renderTo || document.body);

      requestAnimationFrame(function () {
        this.editVoiceModal.activate();
      }.bind(this));
    },

    /* Display the CreateOrganizationModal.
     * @method showCreateOrganizationModal <public> [Function]
     */
    showCreateOrganizationModal : function showCreateOrganizationModal() {
      if (!Person.get()) {
        throw new Error('Not autorized to perform this action.');
      }

      this.appendChild(new CV.UI.Modal({
        title: 'Create an Organization',
        name: 'createAnOrganizationModal',
        action: CV.CreateOrganization,
        width: 540,
      })).render(document.body);

      requestAnimationFrame(function () {
        this.createAnOrganizationModal.activate();
      }.bind(this));
    }
  }
});
