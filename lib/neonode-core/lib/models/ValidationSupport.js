Module('ValidationSupport')({
  prototype : {
    errors : [],
    isValid : function(callback) {
      var model = this;

      this.dispatch('beforeValidate');

      if (!this.constructor.validations) {
        this.constructor.validations = {}
      }

      var checkit = new Checkit(this.constructor.validations);

      checkit.run(model).then(function(validated) {
        callback(true);
        model.dispatch('afterValidate');
      }).catch(Checkit.Error, function(err) {
        model.errors = err;
        callback(false);
      });
    }
  }
});
