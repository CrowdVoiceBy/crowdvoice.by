var InvitationRequest = Class('InvitationRequest').inherits(Argon.KnexModel)({

  validations : {
    invitatorEntityId : ['required'],
    invitedEntityId : ['required']
  },

  storage : (new Argon.Storage.Knex({
    tableName : 'InvitationRequest'
  })),

  prototype : {
    invitatorEntityId : null,
    invitedEntityId : null,
  }
});

module.exports = InvitationRequest;
