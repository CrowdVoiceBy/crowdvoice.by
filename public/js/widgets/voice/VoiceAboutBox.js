/* jshint multistr: true */
Class(CV, 'VoiceAboutBox').inherits(Widget).includes(CV.WidgetUtils)({
    HTML : '\
        <article class="voice-card-about post-card">\
          <div class="voice-card-about-updated-at"></div>\
          <div class="voice-card-about-header -row">\
            <div class="-float-left">\
              <img class="voice-card-about-logo -float-left" src="/img/views/voice/cv-logo-placeholder.png" width="28" height="32" alt="">\
              <h3 class="voice-card-about-title -font-bold -float-left">About this Voice</h3>\
            </div>\
            <button class="voice-about-hide-btn cv-button micro -float-right">Hide</button>\
          </div>\
          <div class="voice-card-about-description"></div>\
        </article>\
    ',

    prototype : {
        /* OPTIONS */
        description : '',

        /* PRIVATE PROPERTIES */
        el : null,
        closeButtonElement : null,
        hideClickHandlerRef : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];
            this.closeButtonElement = this.el.querySelector('.voice-about-hide-btn');

            this.dom.updateHTML(this.el.querySelector('.voice-card-about-description'), this.description);

            this._bindEvents();
        },

        _bindEvents : function _bindEvents() {
            this.hideClickHandlerRef = this.deactivate.bind(this);
            this.closeButtonElement.addEventListener('click', this.hideClickHandlerRef);

            this.showBoxHandlerRef = this.activate.bind(this);
            CV.VoiceView.bind('voiceAboutBox:show', this.showBoxHandlerRef);
        },

        activate : function activate() {
            Widget.prototype.activate.call(this);
            CV.VoiceAboutBox.dispatch('activate');
        },

        deactivate : function deactivate() {
            Widget.prototype.deactivate.call(this);
            CV.VoiceAboutBox.dispatch('deactivate');
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.closeButtonElement.removeEventListener('click', this.hideClickHandlerRef);
            this.hideClickHandlerRef = null;

            CV.VoiceView.unbind('voiceAboutBox:show', this.showBoxHandlerRef);

            this.el = null;
            this.closeButtonElement = null;
        }
    }
});
