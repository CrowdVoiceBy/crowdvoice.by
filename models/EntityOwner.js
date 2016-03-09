var EntityOwner = Class('EntityOwner').inherits(Argon.KnexModel)({

  validations : {},

  storage : (new Argon.Storage.Knex({
    tableName : 'EntityOwner'
  })),
  
  prototype : {

  }
});

module.exports = EntityOwner;
