var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, result) {
    done(err, result[0]);
  });
});

passport.use('local', new LocalStrategy({
  usernameField : 'username',
  passwordField : 'password',
  passReqToCallback : true
}, function(err, username, password, done) {
  var userQuery = db('Users');
  var entityQuery = db('Entities');

  userQuery.where({
    'email': username
  });

  entityQuery.where({
    'profile_name' : username
  });

  var userRaw = false;

  async.series([function(nextSeries) {
    userQuery.asCallback(function(err, result) {
      var user, validPass;

      if (err) { return nextSeries(err); }

      if (result.length === 0) {
        logger.error('User not found');
        return nextSeries(); // User not found
      }

      if (result[0].token !== null) {
        logger.error('User not activated');
        return nextSeries(); // User not activated
      }

      bcrypt.compare(password, result[0].encrypted_password, function(err, valid) {
        if (!valid) {
          logger.error('Invalid password');
          return nextSeries(); // Invalid password
        } else {
          userRaw = result[0];
          nextSeries();
        }
      });
    });
  }, function(nextSeries) {
    entityQuery.asCallback(function(err, result) {
      if (err) {
        return nextSeries(err);
      }

      if (result.length === 0) {
        logger.error('Entity not found');
        return nextSeries(); // Entity not found
      }

      // Find the user of this entity.
      db('Users').where({
        'entity_id' : result[0].id
      }).asCallback(function(err, user) {
        if (err) {
          return nextSeries(err);
        }

        if (user.length === 0) {
          logger.error('User not found');
          return nextSeries();
        }

        if (user[0].token !== null) {
          logger.error('User not activated');
          return nextSeries(); // User not activated
        }

        bcrypt.compare(password, user[0].encrypted_password, function(err, valid) {
          if (!valid) {
            logger.error('Invalid password');
            return nextSeries(); // Invalid password
          } else {
            userRaw = user[0];
            nextSeries();
          }
        });
      });
    });
  }], function(err) {
    done(err, userRaw);
  });
}));
