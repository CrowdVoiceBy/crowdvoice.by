Module(Argon, 'KnexModel').includes(CustomEventSupport, ValidationSupport)({

  /**
  Contains the instance of the storage adapter for the model
  This property must be set when creating the model
  @property storage <public> [Storage] (null)
  **/
  storage : null,

  all : function all(callback) {
    var Model = this;
    var request = {
      find : 'find',
        model : Model
    };

    this.dispatch('beforeAll');
    this.storage.find(request, function(err, data) {
      callback(err, data);
      Model.dispatch('afterAll');
    });

    return this;
  },

  find : function find(params, callback) {
    var Model, request;

    Model = this;

    request = {
      action : 'find',
      model : Model,
      params : params
    }

    switch (params.constructor) {
      case Object:
        request.clauseType = 'where';
        break;
      case Array:
        if (params.length === 2) {
          request.clauseType = 'whereRaw';
        };
    }

    this.dispatch('beforeFind');

    this.storage.find(request, function(err, data) {
      callback(err, data);
      Model.dispatch('afterFind');
    });

    return this;
  },

  findById : function findById(id, callback) {
    var Model, request;

    Model = this;

    request = {
      action : 'findById',
      model : Model,
      params : {
        id : id
      }
    };

    this.dispatch('beforeFindById');

    this.storage.findById(request, function(err, data) {
      callback(err, data);
      Model.dispatch('afterFindById');
    });

    return this;
  },

  prototype : {

    /**
    Object initializer, this method server as the real constructor
    @method init <public>
    @argument properties <optional> [Object] ({}) the attributes for the model isntance
    **/
    init : function init(properties) {
      this.eventListeners = [];

      if (typeof properties !== 'undefined') {
        Object.keys(properties).forEach(function (property) {
          this[property] = properties[property];
        }, this);
      }

      return this;
    },

    /**
    Exposes the value of a property.
    @method getProperty <public>
    @argument property <required> [String] the property to expose.
    @return [Object] the property value.
    **/
    getProperty : function getProperty(property) {
      return this[property];
    },

    /**
    Sets the value of a property.
    @method setProperty <public>
    @argument property <required> [String] the property to write.
    @argument newValue <required> [String] the value for the property.
    @return [Object] instance of the model.
    **/
    setProperty : function setProperty(property, newValue) {
      var originalValue;

      if (newValue !== originalValue) {
        originalValue = this[property];
        this[property] = newValue;

        this.dispatch('change:' + property, {
          originalValue : originalValue,
          newValue      : newValue
        });
      }

      return this;
    },

    /**
    Sets the value of many properties.
    @method setProperties <public>
    @argument data <required> [Object] properties to write.
    @return [Object] instance of the model.
    **/
    setProperties : function setProperties (data) {
      var newValue, originalValue, property,
          properties = Object.keys(data);

      for (var i = 0; i < properties.length; i+=1) {
        property = properties[i];
        originalValue = this[property];
        newValue = data[property];

        if (newValue !== originalValue) {
          this[property] = newValue;

          this.dispatch('change:' + property, {
            originalValue : originalValue,
            newValue      : newValue
          });
        }
      }

      return this;
    },

    /**
    Saves the model to storage.
    @method save <public>
    @argument callback <required> [Function] function to manage response.
    @return Noting.
    **/
    save : function save(callback) {
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

          if (model.hasOwnProperty('id') && model.id !== '') {
            request = {
              action : 'update',
              data : model,
              model : model.constructor
            };
            model.constructor.storage.update(request, function updateCallback(err, data) {
              model.constructor.dispatch('afterSave', {
                data : {
                  model : model
                }
              });

              model.dispatch('afterSave');

              model.dispatch('afterUpdate');

              callback(err, data);
            });
          } else {

            model.createdAt = model.createdAt || date;

            model.dispatch('beforeCreate');

            request = {
              action : 'create',
              data : model,
              model : model.constructor
            }

            model.constructor.storage.create(request, function createCallback(err, data) {
              if (data) {
                model.setProperty('id', data[0]);
              }

              model.constructor.dispatch('afterSave', {
                data : {
                  model : model
                }
              });

              model.dispatch('afterSave');

              model.dispatch('afterCreate');

              callback(err, data);
            });
          }
        } else {
          callback(model.errors);
        }
      });
    },

    /**
    Removes a record from storage.
    @method destroy <public>
    @argument callback [Function] function to manage response.
    @return Noting.
    **/
    destroy : function destroy(callback) {
      var model = this;
      var request = {
        action : 'remove',
        model : model.constructor,
        data : this
      }

      this.dispatch('beforeDestroy');

      this.constructor.storage.remove(request, function destroyCallback(err, response) {
        delete model.id;
        model.dispatch('afterDestroy');
        callback(err, response);
      });
    }
  }
});
