// MONKEY PATCH
// This is in order to fix the issue where if you provide an updatedAt property
// the updatedAt property will be set to what you provided, thus causing
// problems.
Argon.Storage.Knex.prototype.update = function update(requestObj, callback) {
  var storage = this;

  callback = callback || function defaultPutCallBack() {
    throw new Error('callback is undefined');
  };

  if ((typeof requestObj) === 'undefined' || requestObj === null) {
    return callback('requestObj is undefined');
  }

  if (requestObj.data) {
    for (i = 0; i < storage.preprocessors.length; i++) {
      requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
    }
  }

  var date = new Date(Date.now());

  this.updatedAt = date;
  requestObj.data.updated_at = date;

  this.queries.update(requestObj, function(err, data) {
    for (i = 0; i < storage.processors.length; i++) {
      data = storage.processors[i](data, requestObj);
    }

    return callback(err, data);
  });
};


/**
Saves the model to storage.
@method save <public>
@argument callback <required> [Function] function to manage response.
@return Noting.
**/
Argon.KnexModel.prototype.save = function save(callback) {
  var model, request;

  var date = new Date(Date.now());

  model = this;

  this.constructor.dispatch('beforeSave', {
    data : {
      model : this
    }
  });

  this.dispatch('beforeSave');

  this.isValid(function (isValid) {
    if (isValid) {

      model.updatedAt = model.updatedAt || date;

      model.dispatch('beforeUpdate');

      model.constructor.dispatch('beforeUpdate', {
        data : {
          model : model
        }
      });

      if (model.hasOwnProperty('id') && model.id !== '') {
        request = {
          action : 'update',
          data : model,
          model : model.constructor
        };
        model.constructor.storage.update(request, function updateCallback(err, data) {
          model.constructor.dispatch('afterUpdate', {
            data : {
              model : model
            }
          });

          model.dispatch('afterUpdate');

          model.constructor.dispatch('afterSave', {
            data : {
              model : model
            }
          });

          model.dispatch('afterSave');


          callback(err, data);
        });
      } else {

        model.createdAt = model.createdAt || date;

        model.constructor.dispatch('beforeCreate', {
          data : {
            model : model
          }
        });

        model.dispatch('beforeCreate');

        request = {
          action : 'create',
          data : model,
          model : model.constructor
        };

        model.constructor.storage.create(request, function createCallback(err, data) {
          if (data) {
            model.setProperty('id', data[0]);
          }

          model.constructor.dispatch('afterCreate', {
            data : {
              model : model
            }
          });

          model.dispatch('afterCreate');

          model.constructor.dispatch('afterSave', {
            data : {
              model : model
            }
          });

          model.dispatch('afterSave');


          callback(err, data);
        });
      }
    } else {
      callback(model.errors);
    }
  });
};
