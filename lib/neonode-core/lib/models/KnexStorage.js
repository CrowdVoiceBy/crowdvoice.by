/**
KnexJS Storage engine for Argon
The implementation is not really coupled with Argon but it was designed to be used with it
@class Knex
@namespace Argon.Storage
**/
Class(Argon.Storage, 'Knex')({

  processors : [function(data) {
    var sanitizedData, property;

    sanitizedData = [];
    if (data instanceof Array) {
      if (data.length > 0) {
        data.forEach(function(item) {
          if (item instanceof Object) {
            var sanitizedItem = {};

            for (property in item) {
              if (item.hasOwnProperty(property)) {
                sanitizedItem[_s(property).camelize().value()] = item[property];
              }
            }

            sanitizedData.push(sanitizedItem);
          } else {
            sanitizedData.push(item);
          }
        });
      }
    }

    return sanitizedData;
  }],

  preprocessors : [function(data) {
    var sanitizedData, property;

    sanitizedData = {};

    for (property in data) {
      if (data.hasOwnProperty(property)) {
        if ((property !== 'eventListeners') && (property !== 'errors') && property !== '_csrf') {
          sanitizedData[property] = data[property];
        }
      }
    }

    return sanitizedData;
  },
  function(data) {
    var sanitizedData, property;

    sanitizedData = {};

    for (property in data) {
      if (data.hasOwnProperty(property)) {
        sanitizedData[_s(property).underscored().value()] = data[property];
      }
    }

    return sanitizedData;
  }],

  /**
  Instance properties container
  @attribute prototype <public> [Object]
  @prototype
  **/
  prototype : {
    /**
    Holds the processors that are specific only for the instance of the storage
    @property processors <public> [Array] (null)
    **/
    processors : null,

    /**
    Holds the preprocessors that are specific only for the instance of the storage
    @property preprocessors <public> [Array] (null)
    **/
    preprocessors : null,

    /**
    Contains a default set of Knex queries for the model.
    @attribute queries <public> [Object] ({find: knex, findById: knex, create: knex, update: knex, remove: knex})
    **/
    queries : {
      find : function(requestObj, callback) {
        switch (requestObj.clauseType) {
          case 'where':
            db(requestObj.model.storage.tableName).where(requestObj.params).asCallback(callback);
            break;
          case 'whereRaw':
            db(requestObj.model.storage.tableName).whereRaw(requestObj.params[0], requestObj.params[1]).asCallback(callback);
            break;
          default:
            db(requestObj.model.storage.tableName).asCallback(callback)
        }

      },
      findById : function(requestObj, callback) {
        db(requestObj.model.storage.tableName).where(requestObj.params).asCallback(callback)
      },
      create : function(requestObj, callback) {
        db(requestObj.model.storage.tableName).returning('id').insert(requestObj.data).asCallback(callback)
      },
      update : function(requestObj, callback) {
        db(requestObj.model.storage.tableName).where('id', requestObj.data.id).returning('id').update(requestObj.data).asCallback(callback)
      },
      remove : function(requestObj, callback) {
        db(requestObj.model.storage.tableName).where('id', requestObj.data.id).del().asCallback(callback)
      }
    },

    /**
    Holds the table name that are specific only for the instance of the storage
    @property tableName <public> [String] (null)
    **/
    tableName : null,

    /**
    Initializes the instance
    @method init <public>
    @return this
    **/
    init    : function init(config) {
      var storage = this;

      if (typeof config !== 'undefined') {

        if (typeof config.queries !== 'undefined') {
          Object.keys(config.queries || {}).forEach(function(propertyName) {

            storage.queries[propertyName] = config.queries[propertyName];
          });
        }

        Object.keys(config || {}).forEach(function (propertyName) {
          if (propertyName !== 'queries') {
            this[propertyName] = config[propertyName];
          }
        }, this);



      }

      if (this.processors instanceof Array === false){
        this.processors = [].concat(this.constructor.processors);
      } else {
        this.processors = this.processors.concat(this.constructor.processors)
      }

      if (this.preprocessors instanceof Array === false){
        this.preprocessors = [].concat(this.constructor.preprocessors);
      } else {
        this.preprocessors = this.preprocessors.concat(this.constructor.preprocessors);
      }
    },

    create    : function create(requestObj, callback) {
      var storage = this;

      callback = callback || function defaultPostCallback() {
        throw new Error('callback is undefined');
      };

      if ((typeof requestObj) === 'undefined' || requestObj === null) {
        return callback('requestObj is undefined');
      }

      for (i = 0; i < storage.preprocessors.length; i++) {
        requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
      }

      this.queries.create(requestObj, function(err, data) {
        for (i = 0; i < storage.processors.length; i++) {
          data = storage.processors[i](data);
        }

        return callback(err, data);
      });
    },

    find : function find(requestObj, callback) {
      var found, storedData, property;

      var storage = this;

      callback = callback || function defaultGetCallback() {
        throw new Error('callback is undefined');
      };

      for (i = 0; i < storage.preprocessors.length; i++) {
        requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
      }

      if ((typeof requestObj) === 'undefined' || requestObj === null) {
        callback('requestObj is undefined');
        return this;
      }

      this.queries.find(requestObj, function(err, data) {
        for (i = 0; i < storage.processors.length; i++) {
          data = storage.processors[i](data, requestObj);
        }

        return callback(err, data);
      });
    },

    findById : function findById(requestObj, callback) {
      // var data;
      var storage = this;

      for (i = 0; i < storage.preprocessors.length; i++) {
        requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
      }


      this.queries.findById(requestObj, function(err, data) {
        for (i = 0; i < storage.processors.length; i++) {
          data = storage.processors[i](data, requestObj);
        }

        return callback(err, data);
      });
    },

    update : function update(requestObj, callback) {
      var storage = this;

      callback = callback || function defaultPutCallBack() {
        throw new Error('callback is undefined');
      };

      if ((typeof requestObj) === 'undefined' || requestObj === null) {
        return callback('requestObj is undefined');
      }

      var date = new Date(Date.now());

      this.updatedAt = date;

      if (requestObj.data) {
        for (i = 0; i < storage.preprocessors.length; i++) {
          requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
        }
      }

      this.queries.update(requestObj, function(err, data) {
        for (i = 0; i < storage.processors.length; i++) {
          data = storage.processors[i](data, requestObj);
        }

        return callback(err, data);
      });
    },

    remove  : function remove(requestObj, callback) {
      var storage = this;

      callback = callback || function defaultRemoveCallBack() {
        throw new Error('callback is undefined');
      };

      if ((typeof requestObj) === 'undefined' || requestObj === null) {
        callback('requestObj is undefined');
        return this;
      }

      if (requestObj.data) {
        for (i = 0; i < storage.preprocessors.length; i++) {
          requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
        }
      }

      this.queries.remove(requestObj, callback);

      return this;
    }
  }
});
