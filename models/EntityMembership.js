var EntityMembership = Class('EntityMembership').inherits(Argon.KnexModel)({

  validations : {
    entityId : ['required'],
    memberId : ['required']
  },

  storage : (new Argon.Storage.Knex({
    tableName : 'EntityMembership',
    queries : {
      whereIn : function(requestObj, callback) {
        db(requestObj.model.storage.tableName).whereIn(requestObj.columnName, requestObj.array).asCallback(callback);
      }
    },
    whereIn : function whereIn(requestObj, callback) {
      var storage = this;

      for (i = 0; i < storage.preprocessors.length; i++) {
        requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
      }


      this.queries.whereIn(requestObj, function(err, data) {
        for (i = 0; i < storage.processors.length; i++) {
          data = storage.processors[i](data, requestObj);
        }

        return callback(err, data);
      });
    }
  })),

  whereIn : function WhereIn(columnName, array, callback) {
    var Model, request;

    Model = this;

    request = {
      action : 'whereIn',
      model : Model,
      columnName : columnName,
      array : array
    };

    this.dispatch('beforeWhereIn');

    this.storage.whereIn(request, function(err, data) {
      callback(err, data);
      Model.dispatch('afterWhereIn');
    });

    return this;
  },

  prototype : {
    entityId : null,
    memberId : null,
    isAnonymous : false
  }
});

module.exports = EntityMembership;
