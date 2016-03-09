var moment = require('moment')
  , API = require('./../../lib/api')
  , Person = require('./../../lib/currentPerson')
  , Events = require('./../../lib/events')
  , PLACEHOLDERS = require('./../../lib/placeholders');

CV.Message = new Class(CV, 'Message').inherits(Widget)({
  HTML : '\
    <div class="message-text">\
        <div class="message-info -rel">\
            <img class="message-sender-image -color-bg-neutral-x-light">\
            <div class="message-data">\
                <h3 class="data-message-participant -font-normal"></h3>\
                <span class="data-message-date"></span>\
                <p class="data-message-text"></p>\
                <div class="message-notification">\
                    <div class="message-notification-actions"></div>\
                </div>\
            </div>\
        </div>\
    </div>',

  INVITATION_ORGANIZATION_HTML : '<p>You were invited to become a member of {organizationName}. \
    Accepting this invitation will grant you privilege of posting and moderating content on all the Voices by <a href="{url}">{organizationName}</a.</p>',

  INVITATION_VOICE_HTML : '<p>You were invited to become a contributor of <a href="{url}">{voiceName}</a>. \
    Accepting this invitation will grant you privilege of posting and moderating content on the Voice <a href="{url}">{voiceName}</a>.</p>',

  REQUEST_ORGANIZATION_HTML : '<p>{name} has requested to become a member of {organizationName}. \
    If you grant access, {name} will be able to post and moderate content on all the Voices of {organizationName}. <a href="{url}">Go to this Organization\'s settings ›</a></p>',

  REQUEST_VOICE_HTML : '<p>{name} has requested to become a contributor for {voiceTitle}. \
    If you grant access, {name} will be able to post and moderate content of this Voice. <a href="{url}">Go to this Voice\'s settings ›</a></p>',

  INVITATION_ACCEPTED_VOICE_HTML : '<p>Invitation to {voiceTitle} accepted.</p>',

  INVITATION_ACCEPTED_ORGANIZATION_HTML : '<p>Invitation to {organizationName} accepted.</p>',

  INVITATION_REJECTED_VOICE_HTML : '<p>Invitation to {voiceTitle} rejected.</p>',

  INVITATION_REJECTED_ORGANIZATION_HTML : '<p>Invitation to {organizationName} rejected.</p>',

  prototype : {
    data : null,
    init : function init(config) {
      Widget.prototype.init.call(this, config);
      this.messageActionsWrapper =this.element.find('.message-notification-actions');

      if (this.type === 'message') {
        this.element.find('.message-data .message-notification').remove();
      }
    },

    setup : function setup() {
      var message = this;
      var participant;

      if (message.data.senderEntity.id !== Person.get('id')) {
        participant = message.data.senderEntity.name;
      } else {
        participant = 'You';
      }

      message.element.find('.message-data .data-message-participant').text(participant);

      if (message.data.senderEntity.images.notification) {
        message.element.find('.message-sender-image').attr('src', message.data.senderEntity.images.notification.url);
      } else {
        message.element.find('.message-sender-image').attr('src', PLACEHOLDERS.notification);
      }

      message.element.find('.message-data .data-message-date').text(moment(new Date(message.data.createdAt).toISOString()).format('• MMMM Do, YYYY • h:mm A'));
      message.element.find('.message-data .data-message-text')[0].insertAdjacentHTML('beforeend', message.data.message);

      if (message.type !== 'message' && message.type !== 'report') {
        var text = this.constructor[this.type.toUpperCase() + '_HTML'];

        var sender = false;
        if (this.data.senderEntity.type === 'organization') {
          if (Person.ownerOf('organization', this.data.senderEntity.id)) {
            sender = true;
          }
        } else {
          if (Person.is(message.data.senderEntity.id)) {
            sender = true;
          }
        }

        if (sender === false) {
          switch(message.type) {
            case 'invitation_organization':
              text = text.replace(/{organizationName}/g, message.data.organization.name)
                      .replace(/{url}/, '/' + message.data.organization.profileName + '/');
              break;
            case 'invitation_voice':
              text = text.replace(/{voiceName}/g, message.data.voice.title)
                      .replace(/{url}/g, '/' + message.data.voice.owner.profileName + '/' + message.data.voice.slug + '/');
              break;
            case 'request_organization':
              text = text
                      .replace(/{name}/g, message.data.senderEntity.name)
                      .replace(/{organizationName}/g, message.data.organization.name)
                      .replace(/{url}/, '/' + message.data.organization.profileName + '/edit/');
              break;
            case 'request_voice':
              text = text.replace(/{name}/g, message.data.senderEntity.name)
                      .replace(/{voiceTitle}/g, message.data.voice.title)
                      .replace(/{url}/g, '/' + Person.get().profileName + '/' + message.data.voice.slug + '/');
              break;
            case 'invitation_accepted_voice':
              text = text.replace(/{voiceTitle}/, message.data.voice.title);
              break;

            case 'invitation_accepted_organization':
              text = text.replace(/{organizationName}/, message.data.organization.name);
              break;

            case 'invitation_rejected_voice':
              text = text.replace(/{voiceTitle}/, message.data.voice.title);
              break;

            case 'invitation_rejected_organization':
              text = text.replace(/{organizationName}/, message.data.organization.name);
              break;
          }

          if (message.type === "invitation_organization" || message.type === "invitation_voice") {
            this._addActionButtons();
          }
        } else {
          switch(message.type) {
            case 'invitation_voice':
              text = '<p>You invited ' + message.thread.data.receiverEntity.name + ' to become a contributor of ' + message.data.voice.title + '.</p>';
              break;

            case 'invitation_organization':
              text = '<p>You invited ' + message.thread.data.receiverEntity.name + ' to become a member of ' + message.data.organization.name + '.</p>';
              break;

            case 'request_voice':
              text = '<p>You have requested to become a contributor for {voiceTitle}.</p>'.replace(/{voiceTitle}/, message.data.voice.title);
              break;

            case 'request_organization':
              text = '<p>You have requested to become a member of {organizationName}.</p>'.replace(/{organizationName}/, message.data.organization.name);
              break;

            case 'invitation_accepted_voice':
              text = text.replace(/{voiceTitle}/, message.data.voice.title);
              break;

            case 'invitation_accepted_organization':
              text = text.replace(/{organizationName}/, message.data.organization.name);
              break;

            case 'invitation_rejected_voice':
              text = text.replace(/{voiceTitle}/, message.data.voice.title);
              break;

            case 'invitation_rejected_organization':
              text = text.replace(/{organizationName}/, message.data.organization.name);
              break;
          }
        }

        this.element.find('.message-data .message-notification').prepend(text);
      }

      return this;
    },

    /* Adds the [Accept, Accept as Anonymous] [Reject] buttons for invitations.
     * @method _addActionButtons <private> [Function]
     * @return Message
     */
    _addActionButtons : function _addActionButtons() {
      var positiveGroupButtons = document.createElement('div');
      positiveGroupButtons.className = 'cv-button-group multiple';

      this.appendChild(new CV.UI.Button({
        name : 'actionAcceptButton',
        className : 'micro -ghost positive',
        data : {value: 'Accept'}
      })).render(positiveGroupButtons);

      this.appendChild(new CV.UI.Button({
        name : 'actionAcceptAsAnonButton',
        className : 'micro -ghost positive',
        data : {value: 'Accept as an Anonymous Member'}
      })).render(positiveGroupButtons);

      this.messageActionsWrapper.append(positiveGroupButtons);

      this.appendChild(new CV.UI.Button({
        name : 'actionRejectButton',
        className : 'micro -ghost negative -ml10px',
        data: {value: 'Reject'}
      })).render(this.messageActionsWrapper);

      this._bindActionButtonsEvents();
      return this;
    },

    /* Disables the [Accept, Accept as Anonymous] [Reject] action buttons.
     * @method _disableActionButtons <private> [Function]
     * @return Message
     */
    _disableActionButtons : function _disableActionButtons() {
      this.actionAcceptButton.disable();
      this.actionAcceptAsAnonButton.disable();
      this.actionRejectButton.disable();
      return this;
    },

    /* Register the event handlers for the [Accept, Accept as Anonymous] [Reject] action buttons.
     * @method _bindActionButtonsEvents <private> [Function]
     * @return Message
     */
    _bindActionButtonsEvents : function _bindActionButtonsEvents() {
      this._acceptInvitationHandlerRef = this._acceptInvitationHandler.bind(this);
      Events.on(this.actionAcceptButton.el, 'click', this._acceptInvitationHandlerRef);

      this._acceptAsAnonInvitationHandlerRef = this._acceptAsAnonInvitationHandler.bind(this);
      Events.on(this.actionAcceptAsAnonButton.el, 'click', this._acceptAsAnonInvitationHandlerRef);

      this._rejectInvitationHandlerRef = this._rejectInvitationHandler.bind(this);
      Events.on(this.actionRejectButton.el, 'click', this._rejectInvitationHandlerRef);
      return this;
    },

    /* Unregister the event handlers for the [Accept, Accept as Anonymous] [Reject] action buttons.
     * @method _unbindActionButtonsEvents <private> [Function]
     * @return Message
     */
    _unbindActionButtonsEvents : function _unbindActionButtonsEvents() {
      Events.off(this.actionAcceptButton.el, 'click', this._acceptInvitationHandlerRef);
      this._acceptInvitationHandlerRef = null;

      Events.off(this.actionAcceptAsAnonButton.el, 'click', this._acceptAsAnonInvitationHandlerRef);
      this._acceptAsAnonInvitationHandlerRef = null;

      Events.off(this.actionRejectButton.el, 'click', this._rejectInvitationHandlerRef);
      this._rejectInvitationHandlerRef = null;
    },

    /* Handles the [Accept] action button click event.
     * @method _acceptInvitationHandler <private> [Function]
     * @return undefined
     */
    _acceptInvitationHandler : function _acceptInvitationHandler() {
      this._disableActionButtons();

      API.threatAnswerInvitation({
        profileName: Person.get('profileName'),
        threadId: this.data.threadId,
        messageId: this.data.id,
        data : {action: 'accept'}
      }, function(err, res) {
        if (err) {
          return console.log(res);
        }
        this._unbindActionButtonsEvents();
        this.messageActionsWrapper.remove();
        this.element.find('.message-notification > p').html('Invitation Accepted.');
      }.bind(this));
    },

    /* Handles the [Accept as an Anonymous Member] action button click event.
     * @method _acceptAsAnonInvitationHandler <private> [Function]
     * @return undefined
     */
    _acceptAsAnonInvitationHandler : function _acceptAsAnonInvitationHandler() {
      this._disableActionButtons();

      API.threatAnswerInvitation({
        profileName: Person.get('profileName'),
        threadId: this.data.threadId,
        messageId: this.data.id,
        data : {action: 'accept', anonymous: true}
      }, function(err, res) {
        if (err) {
          return console.log(res);
        }
        this._unbindActionButtonsEvents();
        this.messageActionsWrapper.remove();
        this.element.find('.message-notification > p').html('Invitation accepted as anonymous.');
      }.bind(this));
    },

    /* Handles the [Reject] action button click event.
     * @method _rejectInvitationHandler <private> [Function]
     * @return undefined
     */
    _rejectInvitationHandler : function _rejectInvitationHandler() {
      this._disableActionButtons();

      API.threatAnswerInvitation({
        profileName: Person.get('profileName'),
        threadId: this.data.threadId,
        messageId: this.data.id,
        data : {action: 'ignore'}
      }, function(err, res) {
        if (err) {
          return console.log(res);
        }
        this._unbindActionButtonsEvents();
        this.messageActionsWrapper.remove();
        this.element.find('.message-notification > p').html('Invitation rejected.');
      }.bind(this));
    }
  }
});
