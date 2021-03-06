/* globals App */
var Events = require('./../../../../../lib/events')
  ,  API = require('./../../../../../lib/api');

Class(CV, 'PostCreatorFromSourcesSourceTwitter').inherits(Widget).includes(CV.WidgetUtils)({
  HTML: '\
    <div>\
      <div data-list></div>\
      <div class="-p2" data-button-wrapper></div>\
    </div>',

  isAuth: function isAuth(callback) {
    API.hasTwitterCredentials(function (err, res) {
      if (err || res.errors) {
        return callback(true, res);
      }
      return callback(false, res.hasTwitterCredentials);
    });
  },

  prototype: {
    /* the last query search */
    query: '',
    /* the results data to be rendered */
    data: null,

    maxId: null,
    _totalItems: 0,
    _requestsCounter: 0,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this._setup()._bindEvents();
    },

    _setup: function _setup() {
      this.appendResults(this.data);
      this.appendChild(new CV.UI.Button({
        name: 'moreButton',
        className: 'primary -block',
        data: {value: 'Show more results'}
      })).render(this.element[0].querySelector('[data-button-wrapper]'));
      return this;
    },

    _bindEvents: function _bindEvents() {
      this._loadMoreClickHandlerRef = this._loadMoreClickHandler.bind(this);
      Events.on(this.moreButton.el, 'click', this._loadMoreClickHandlerRef);
    },

    _loadMoreClickHandler: function _loadMoreClickHandler() {
      this._requestsCounter++;
      this.moreButton.disable();
      this.parent.setAppendingResultsState();

      API.searchPostsInSource({
        profileName: App.Voice.data.owner.profileName,
        voiceSlug: App.Voice.data.slug,
        source: 'twitter',
        data: {
          query: this.query,
          maxId: this.maxId
        }
      }, this._requestResponseHandler.bind(this));
    },

    _requestResponseHandler: function _requestResponseHandler(err, res) {
      if (err) return console.log(err);

      this.appendResults(res);
      this.parent.updateHeaderText(this._totalItems, this.query);
      this.moreButton.enable();
      this.parent.setResultsAppendedState();
    },

    appendResults: function appendResults(res) {
      var child = CV[this.constructor.className + 'Item']
        , fragment = document.createDocumentFragment()
        , resLen = res.length;

      res.forEach(function(data, index) {
        this.appendChild(new child({
          name: 'item-t-' + (index * this._requestsCounter),
          data: data
        })).render(fragment);
      }, this);
      this.element[0].querySelector('[data-list]').appendChild(fragment);

      this.data = res;
      this._totalItems += resLen;
      this.maxId = this.data[resLen - 1].id_str;
    }
  }
});
