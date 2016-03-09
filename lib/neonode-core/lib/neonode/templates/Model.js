var <%= singular %> = Class('<%= singular %>').inherits(Argon.KnexModel)({

  validations : {},

  storage : (new Argon.Storage.Knex({
    tableName : '<%= name %>'
  })),
  
  prototype : {

  }
});

module.exports = <%= singular %>;
