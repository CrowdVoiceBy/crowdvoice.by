var constants = require('./../../../lib/constants');

Class(CV, 'VoiceCoverActions').inherits(Widget).includes(CV.WidgetUtils)({
  ELEMENT_CLASS: 'cv-cover-actions cv-button-group multiple',
  prototype: {
    voiceEntity: null,
    init: function init(config) {
      Widget.prototype.init.call(this, config);
      this.el = this.element[0];

      if (this.voiceEntity.status === constants.VOICE.STATUS_DRAFT) {
        this.appendChild(new CV.VoiceCoverActionsPublish({
          name: 'publish',
          voiceEntity: this.voiceEntity,
          data: {value: 'Publish'}
        })).render(this.el);
      }

      this.appendChild(new CV.VoiceCoverActionsEdit({
        name: 'edit',
        voiceEntity: this.voiceEntity,
        data: {value: 'Edit'}
      })).render(this.el);

      if (this.voiceEntity.status !== constants.VOICE.STATUS_ARCHIVED) {
        this.appendChild(new CV.VoiceCoverActionsArchive({
          name: 'archive',
          voiceEntity: this.voiceEntity,
          data: {value: 'Archive'}
        })).render(this.el);
      }
    }
  }
});
