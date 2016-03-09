var Events = require('../../../../../lib/events');

Class(CV, 'PopoverTwitterNotLoggedIn').inherits(Widget)({
  HTML: '\
    <div>\
      <h3 class="-mt0 -font-bold">Psst! Want to avoid this step next time?</h3>\
      <p>Create an account and log in to CrowdVoice.by.<br/>\
      Then come back and connect your twitter account once and for all. 😀</p>\
      <div class="-mt1">\
        <a href="/signup" class="cv-button small -mr1">Sign up</a>\
        <a href="#" class="connect-twitter-link">Connect Twitter</a>\
      </div>\
    </div>',

  prototype: {
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      this._dispatchConnectRef = this._dispatchConnect.bind(this);
      Events.on(this.el.querySelector('.connect-twitter-link'), 'click', this._dispatchConnectRef);
    },

    _dispatchConnect: function _dispatchConnect(ev) {
      ev.preventDefault();
      this.dispatch('connect-twitter');
    },

    destroy: function destroy() {
      Events.off(this.el.querySelector('.connect-twitter-link'), 'click', this._dispatchConnectRef);
      this._dispatchConnectRef = null;
      Widget.prototype.destroy.call(this);
      return null;
    }
  }
});
