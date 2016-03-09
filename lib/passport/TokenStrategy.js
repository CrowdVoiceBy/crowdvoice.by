var TokenStrategy = require('passport-token').Strategy;

passport.use(new TokenStrategy({

  usernameQuery: 'username',
  tokenQuery:     'token'
}, function (username, token, done) {
    User.find({token: token}, function (err, user) {
      if (err) {
        logger.error('Error');
        logger.error(err)
        return done(err);
      }

      if (!user || user.length === 0) {
        logger.error('User not found');
        return done(null, false);
      }

      user = user[0];

      return done(null, user);
    });
  }
));
