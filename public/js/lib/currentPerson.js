/* CurrentPerson Registry and Helper.
 * get() => returns the whole currentPerson object
 * anon() => returns {true|false} depending if currentPerson is browsing in anonnymous mode
 * is(id) => returns {true|false} if personId matched with the passed id
 * ownerOf('organization', organizationID) => returns {true|false} if person is owner of the passed organization
 * memberOf('organization', organizationID) => returns {true|false} if person is either a member or owner of the passed organization
 * memberOf('voice', voiceID) => returns {true|false} if person is a member of the passed voice
 * ownedOrganizations() => returns {true|false} if person is owner of at least 1 organization
 */

var PLACEHOLDERS = require('./placeholders')
  , constants = require('./constants');

module.exports = {
  _ : null,

  set : function set(data) {
    this._ = data;
  },

  /* Returns all properties of currentPerson.
   * If a propertyName is passed as param it will just return the value of that property.
   * @params {string} [propertyName]
   */
  get : function get (propertyName) {
    if (propertyName) { return this._[propertyName]; }
    return this._;
  },

  /* Checks if currentPerson has the same hashid as the passed one as param.
   * @param {string} id - encode entity id (hashid)
   * @return {Boolean}
   */
  is : function is (id) {
    if (!id) { return false; }
    return (this.get() && (this.get().id === id));
  },

  /* Checks if currentPerson is in anonymous mode.
   * @return {Boolean}
   */
  anon : function anon () {
    return (this.get() && (this.get().isAnonymous));
  },

  /* Checks if currentPerson is the owner of a specific organization.
   * @param {string} type - ('organization'|'voice')
   * @param {String} id - {organization,voice}.id (hashid)
   * @return {Boolean}
   */
  ownerOf : function ownerOf (type, id) {
    if (!this.get()) { return false; }

    if (type === 'organization') {
      return (this.get().ownedOrganizations.some(function(organization) {
        return (organization.id === id);
      }));
    }

    if (type === 'voice') {
      if ((!this.get().ownedVoices) || (!this.get().ownedVoices.length)) {
        return false;
      }

      return (this.get().ownedVoices.indexOf(id) !== -1);
    }
  },

  /* Checks if currentPerson is member of a specific organization or a specific voice.
   * @param {string} type - ('organization'|'voice')
   * @param {String} id - {organization,voice}.id (hashid)
   * @return {Boolean}
   */
  memberOf : function memberOf (type, id) {
    if (!this.get()) { return false; }

    if (type === 'organization') {
      var organizations = this.get().organizations.concat(this.get().ownedOrganizations);
      return (organizations.some(function(organization) {
        return (organization.id === id);
      }));
    }

    if (type === 'voice') {
      var voices = this.get().voiceIds.concat(this.get().ownedVoices);
      if (!voices.length) { return false; }

      return (voices.indexOf(id) !== -1);
    }
  },

  /* Checks if currentPerson is NOT a member of a specific organization or a specific voice.
   * @param {string} type - ('organization'|'voice')
   * @param {String} id - {organization,voice}.id (hashid)
   * @return {Boolean}
   */
  notMemberOf : function notMemberOf(type, id) {
    return !this.memberOf(type, id);
  },

  /* Returs whether currentPerson owns at least 1 organization.
   * @return {Boolean}
   */
  ownsOrganizations : function ownsOrganizations() {
    return this.get('ownedOrganizations').length;
  },

  canPostDirectlyOnVoice: function canPostDirectlyOnVoice(voiceEntity) {
    if (!this.get()) return false;

    if (this.ownerOf('voice', voiceEntity.id)) return true;

    if (voiceEntity.owner.type === 'organization') {
      return (this.memberOf('organization', voiceEntity.owner.id) ||
        this.memberOf('voice', voiceEntity.id));
    }

    return false;
  },

  /* Checks if an Entity can be invited either to a voice or to an organization.
   * @param {Object} entity - Entity's Model
   * @return {Boolean}
   */
  canInviteEntity : function canInviteEntity(entity) {
    return (this.canInviteEntityToAVoice(entity) ||
        this.canInviteEntityToAnOrg(entity));
  },

  /* Checks if an Entity does not belongs to at least one of currentPerson's voices.
   * @param {Object} entity - Entity's Model
   * @return {Boolean}
   */
  canInviteEntityToAVoice : function canInviteEntityToAVoice(entity) {
    if (!this.get().voiceNames.length) { return false; }

    return (this.get().voiceNames.some(function(voice) {
      if (voice.type === constants.VOICE.TYPE_CLOSED) {
        return (entity.voiceIds.indexOf(voice.id) === -1);
      }
      return false;
    }));
  },

  /*
   * Checks if an Entity does not belongs to at least one of currentPerson's ownedOrganizations.
   * @param {Object} entity - Entity's Model
   * @return {Boolean}
   */
  canInviteEntityToAnOrg : function canInviteEntityToAnOrg(entity) {
    if (!this.get().ownedOrganizations.length) { return false; }

    return (this.get().ownedOrganizations.some(function(organization) {
      return (entity.organizationIds.indexOf(organization.id) === -1);
    }));
  },

  /* Tries to retrieves a specific version of the person images,
   * if it doest not exists it will try to return a placeholder instead
   * otherwhise it will return null.
   * @return {String|null} (image path | placeholder path | null)
   */
  getImage : function getImage(version) {
    var images = this.get().images;
    if (images[version]) { return images[version].url; }
    if (PLACEHOLDERS[version]) { return PLACEHOLDERS[version]; }
    return null;
  }
};
