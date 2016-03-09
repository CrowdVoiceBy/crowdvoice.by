var User = Class('User').inherits(Argon.KnexModel)({

  validations : {
    email: [
      'email', 'required',
      {
        rule: function (val, params, context) {
          var query = db('Users').where('email', '=', val);
          if (this.target.id) {
            query.andWhere('id', '!=', this.target.id);
          }
          return query.then(function(resp) {
            if (resp.length > 0) throw new Checkit.FieldError('Please use another email.');
          });
        },
        message: 'This email address is already in use.'
      }
    ],
    password: [
      'minLength:8'
    ]
  },

  storage : (new Argon.Storage.Knex({
    tableName : 'Users'
  })),

  prototype : {
    email : null,
    password: null,
    token:    null,
    deleted : false,

    init : function init(config) {
      Argon.KnexModel.prototype.init.call(this, config);

      var model = this;

      this.bind('beforeCreate', function(data) {
        model.token = bcrypt.hashSync(CONFIG.sessionSecret + Date.now(), bcrypt.genSaltSync(12), null);
      });

      this.bind('beforeSave', function (event) {
        /* Here the best case scenario is to verify that the model is valid by executing isValid, but since
         * we cannot use it because because Argon does not trigger 'beforeSave' asynchronously,
         * then we have to replicate the validation: password.length >= 8 */
        if (model.password && model.password.length >= 8) {
          model.encryptedPassword = bcrypt.hashSync(model.password, bcrypt.genSaltSync(10), null);
          delete model.password;
        }
      });
    },

    markAsDeleted : function markAsDeleted(callback) {
      if (!this.id) {
        return callback(new Error('Invalid ID'));
      }

      this.deleted = true;

      this.save(callback);
    },


    /* Returns the user's associated entity
     * @method entity
     */
    entity : function entity (done) {
      Entity.find({id: this.entityId, is_anonymous : false}, function (err, result) {
        result = result[0];

        result.id = hashids.encode(result.id);

        done(err, new Entity(result));
      });
    },

    /* Returns the user's associated shadow entity
     * @method shadow
     */
    shadow : function shadow(done) {
      var model = this;

      model.entity(function(err, person) {
        if (err) {
          return done(err);
        }

        db('Entities')
          .whereIn('id', db('EntityOwner').select('owned_id').where('owner_id', '=', model.entityId))
          .andWhere('is_anonymous', '=', true)
          .andWhere('type', '=', 'person')
          .asCallback(function(err, result) {
            if (err) {
              return done(err);
            }

            var result = result[0]

            var shadowEntity = new Entity({
              id : result.id,
              name : result.name,
              profileName : person.profileName,
              isAnonymous : result.is_anonymous,
              createdAt : result.created_at,
              updatedAt : result.updated_at
            });

            // shadowEntity.id = hashids.encode(shadowEntity.id);

            return done(null, shadowEntity)
          });
      })
    },

    /* Returns the model raw data. It also filters the sensitive data.
     * @method toJson
     */
    toJson: function toJson () {
      var json = {},
        model = this,
        filtered = [
          'errors', 'eventListeners', '_csrf', 'encryptedPassword', 'deleted'
        ];

      Object.keys(this).forEach(function (property) {
        if (filtered.indexOf(property) === -1) {
          json[property] = model[property];
        }
      });

      return json;
    }
  }
});

module.exports = User;
