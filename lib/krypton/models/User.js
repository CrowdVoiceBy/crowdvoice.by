K.User = Class(K, 'User').inherits(Krypton.Model)({
  tableName: 'Users',

  attributes: [
    'id',
    'entityId',
    'email',
    'encryptedPassword',
    'token',
    'deleted',
    'createdAt',
    'updatedAt'
  ],

  validations: {
    email: [
      'email',
      'required',
      {
        rule: function (val, params, context) {
          var query = K.User.query()
            .where('email', '=', val)

          if (this.target.id) {
            query.andWhere('id', '!=', this.target.id)
          }

          query.then(function (r) {
            if (r.length > 0) {
              throw new Checkit.FieldError('This email address is already in use.')
            }
          })
        },
        message: 'This email address is already in use.'
      }
    ],
    password: ['required', 'minLength:8']
  },

  prototype: {
    deleted: false,

    init: function (config) {
      Krypton.Model.prototype.init.call(this, config)

      var model = this

      this.on('beforeCreate', function(callback) {
        model.token = bcrypt.hashSync(CONFIG.sessionSecret + Date.now(), bcrypt.genSaltSync(12), null)

        return callback()
      })

      this.on('beforeSave', function (callback) {
        /* Here the best case scenario is to verify that the model is valid by executing isValid, but since
         * we cannot use it because because Argon does not trigger 'beforeSave' asynchronously,
         * then we have to replicate the validation: password.length >= 8 */
        if (model.password && model.password.length >= 8) {
          model.encryptedPassword = bcrypt.hashSync(model.password, bcrypt.genSaltSync(10), null)
          delete model.password
        }

        return callback()
      })
    }
  }
})

module.exports = new K.User()
