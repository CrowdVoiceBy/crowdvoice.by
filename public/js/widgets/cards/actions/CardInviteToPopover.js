/* Class CV.CardInviteToPopover
 * Displays the 'Cotribute in voice...' bubble-item is currentPerson has any voices to invite to.
 * Displays the 'Become a member...' bubble-item if currentPerson has any organization to invite to.
 * In any case it will also instantiate the appropiate form Modal to render when clicked.
 * Each Modal handles its own logic.
 */

var Person = require('./../../../lib/currentPerson');

Class(CV, 'CardInviteToPopover').inherits(Widget)({
    ELEMENT_CLASS : 'ui-vertical-list hoverable -list-clean',
    HTML : '<ul></ul>',
    HTML_VOICE_ITEM : '<li class="ui-vertical-list-item -nw" data-action="contribute">Contribute in voice&hellip;</li>',
    HTML_ORGANIZATION_ITEM : '<li class="ui-vertical-list-item -nw" data-action="member">Become a member of&hellip;</li>',

    prototype : {
        /* Entity Model
         */
        entity : null,

        el : null,

        /* indicates if currentPerson has voices [Boolean] */
        _hasVoices : false,
        contributeItem : null,
        _inviteToVoiceClickHandlerRef : null,

        /* indicates if currentPerson own at least one organization */
        _ownOrganizations : false,
        memberButton : null,
        _inviteToOrgClickHandlerRef : null,

        init : function init(config) {
            Widget.prototype.init.call(this, config);

            this.el = this.element[0];

            this._hasVoices = Person.canInviteEntityToAVoice(this.entity);
            if (this._hasVoices) {
                this._setInviteToVoice();
            }

            this._ownOrganizations = Person.canInviteEntityToAnOrg(this.entity);
            if (this._ownOrganizations) {
                this._setInviteToOrganization();
            }
        },

        /* Sets the 'Contribute in voice' item to be displayed on the ui,
         * instantiate its modal and register its events.
         * @method _setInviteToVoice <private> [Function]
         */
        _setInviteToVoice : function _setInviteToVoice() {
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_VOICE_ITEM);
            this.contributeItem = this.el.querySelector('[data-action="contribute"]');

            this._inviteToVoiceClickHandlerRef = this._inviteToVoiceClickHandler.bind(this);
            this.contributeItem.addEventListener('click', this._inviteToVoiceClickHandlerRef);
        },

        /* Sets the 'Become a member of' item on the ui, instantiate its modal
         * and register its events.
         * @method _setInviteToOrganization <private> [Function]
         */
        _setInviteToOrganization : function _setInviteToOrganization() {
            this.el.insertAdjacentHTML('beforeend', this.constructor.HTML_ORGANIZATION_ITEM);
            this.memberButton = this.el.querySelector('[data-action="member"]');

            this._inviteToOrgClickHandlerRef = this._inviteToOrgClickHandler.bind(this);
            this.memberButton.addEventListener('click', this._inviteToOrgClickHandlerRef);
        },

        /* Render the inviteToContributeModal
         * @method _inviteToVoiceClickHandler <private> [Function]
         */
        _inviteToVoiceClickHandler : function _TetivnitVoiceClickHandler() {
            this.appendChild(new CV.UI.Modal({
                title : 'Invite to Contribute',
                name : 'inviteToContributeModal',
                action : CV.InviteToContribute,
                width : 650,
                data : this.entity
            })).render(document.body);

            requestAnimationFrame(function() {
                this.inviteToContributeModal.activate();
            }.bind(this));
        },

        /* Render the inviteToOrganizationModal
         * @method _inviteToOrgClickHandler <private> [Function]
         */
        _inviteToOrgClickHandler : function _inviteToOrgClickHandler() {
            this.appendChild(new CV.UI.Modal({
                title : 'Invite to Organization',
                name : 'inviteToOrganizationModal',
                action : CV.InviteToOrganization,
                width : 650,
                data : this.entity
            })).render(document.body);

            requestAnimationFrame(function() {
                this.inviteToOrganizationModal.activate();
            }.bind(this));
        },

        destroy : function destroy() {
            Widget.prototype.destroy.call(this);

            this.el = null;

            if (this._hasVoices) {
                this._hasVoices = null;
                this.contributeItem.removeEventListener('click', this._inviteToVoiceClickHandlerRef);
                this._inviteToVoiceClickHandlerRef = null;
                this.contributeItem = null;
            }

            if (this._ownOrganizations) {
                this._ownOrganizations = null;
                this.memberButton.removeEventListener('click', this._inviteToOrgClickHandlerRef);
                this._inviteToOrgClickHandlerRef = null;
                this.memberButton = null;
            }

            return null;
        }
    }
});
