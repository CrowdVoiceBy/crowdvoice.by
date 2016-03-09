Class(CV, 'TopVoice').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'top-voice -full-height -full-width',
  HTML: '\
    <div>\
      <div class="top-voice__overflow -abs -overflow-hidden -rel -full-height -full-width">\
        <video class="top-voice__video" muted="true" autoplay loop>\
          <source type="video/mp4">\
          <source type="video/ogg">\
        </video>\
        <div class="top-voice__info -abs">\
          <p class="top-voice__info-label -upper -color-primary">Top Voice</p>\
          <p class="top-voice__info-title">\
            <a class="top-voice__info-title-anchor -inline-block -tdn -font-bold" href="/"></a>\
          </p>\
          <p class="top-voice__info-description -font-light -color-white"></p>\
          <p class="top-voice__info-author -color-white -font-light">\
            by <a href="/"></a>\
          </p>\
        </div>\
        <p class="top-voice__video-source -abs -color-white -font-light">\
          Video via <a class="-font-bold -tdn" target="_blank"></a>\
        </p>\
      </div>\
    </div>',

  VOICE_BUTTON_TEMPLATE: '\
    <div class="-mt3">\
      <a href="{href}" class="cv-button small -ghost dark-transparent -font-semi-bold">Go to Voice</a>\
    </div>',

  prototype: {
    data: null,

    /* @param {Object} config
     * @property {Object} config.data
     * @property {Object} config.data.voice - VoicePresenter
     * @property {string} config.data.video_path - the video path with no extension.
     * @property {Object} config.data.video_source
     * @property {string} config.data.video_source.url - the video’s source url to display its credits.
     * @property {string} config.data.video_source.text - text to display on the video credits link.
     * @property {string} config.data.video_poster - the video poster image.
     * @property {string} config.data.description - top voice custom description.
     */
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];
      this.videoElement = this.el.querySelector('video');

      this._setup();
    },

    /* @private
     */
    _setup: function _setup() {
      var voiceLink = this.el.querySelector('.top-voice__info-title-anchor')
        , authorLink = this.el.querySelector('.top-voice__info-author a')
        , sourceLink = this.el.querySelector('.top-voice__video-source a')
        , mediaPath = '/';

      if (this.ENV !== 'development') {
        mediaPath = 'https://s3.amazonaws.com/crowdvoice.by/';
      }

      this.dom.updateAttr('poster', this.videoElement, mediaPath + this.data.posterPath);
      this.dom.updateAttr('src', this.el.querySelector('[type="video/ogg"]'), mediaPath + this.data.videoPath + '.ogv');
      this.dom.updateAttr('src', this.el.querySelector('[type="video/mp4"]'), mediaPath + this.data.videoPath + '.mp4');

      this.dom.updateText(voiceLink, this.data.voice.title);
      this.dom.updateAttr('href', voiceLink, this._getVoiceUrl());
      this.dom.updateAttr('title', voiceLink, this.data.voice.title);

      this.dom.updateText(this.el.querySelector('.top-voice__info-description'), this.data.description || this.data.voice.description);

      this.dom.updateAttr('href', authorLink, '/' + this.data.voice.owner.profileName + '/');
      this.dom.updateText(authorLink, this.data.voice.owner.name);

      this.dom.updateAttr('href', sourceLink, this.data.sourceUrl);
      this.dom.updateText(sourceLink, this.data.sourceText);

      authorLink = sourceLink = null;
    },

    /* Returns the voice url.
     * @private
     * @return {string} the voice url
     */
    _getVoiceUrl: function _getVoiceUrl() {
      return ('/' + this.data.voice.owner.profileName + '/' + this.data.voice.slug + '/');
    },

    /* Appends the `Go to Voice` link.
     * @public
     * @return {Object} TopVoice
     */
    showVoiceButton: function showVoiceButton() {
      var infoElement = this.el.querySelector('.top-voice__info')
        , buttonString = this.constructor.VOICE_BUTTON_TEMPLATE
        , description = this.el.querySelector('.top-voice__info-description');

      // switch description and author direction-flow
      infoElement.appendChild(description);

      buttonString = buttonString.replace(/{href}/, this._getVoiceUrl());
      infoElement.insertAdjacentHTML('beforeend', buttonString);

      buttonString = infoElement = null;
      return this;
    }
  }
});
