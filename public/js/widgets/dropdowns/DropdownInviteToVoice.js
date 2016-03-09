var Person = require('./../../lib/currentPerson')
  , constants = require('./../../lib/constants');

Class(CV.UI, 'DropdownInviteToVoice').inherits(CV.UI.DropdownRegular)({
  prototype: {
    /* Entity Model to invite */
    entity: null,
    _items: null,

    /* Fill the dropdown options using currentPerson data. It will add currentPerson itself and
     * its owned organizations (if any).
     * @override
     */
    _setup: function _setup() {
      CV.UI.DropdownRegular.prototype._setup.call(this);

      Person.get('voiceNames').filter(function (voice) {
        return voice.type === constants.VOICE.TYPE_CLOSED;
      }).forEach(function (voice) {
        if (this.entity.voiceIds.indexOf(voice.id) === -1) {
          console.log(voice);
          this.dropdown.addContent(this._createItem(voice));
        }
      }, this);

      this._items = [].slice.call(this.dropdown.getContent());
      return this;
    },

    /* @override
     */
    _createItem: function _createItem(voice) {
      var listElement = document.createElement('div');
      listElement.className = 'ui-vertical-list-item -p0';
      this.dom.updateAttr('data-value', listElement, voice.id);

      this.appendChild(new CV.VoiceCoverSingleRow({
        name: 'item_' + voice.id,
        className: 'dropdown-voice-ownership__item',
        data: voice
      })).render(listElement);

      return listElement;
    },
  }
});
