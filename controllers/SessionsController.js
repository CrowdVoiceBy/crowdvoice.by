require(__dirname + '/../lib/passport/LocalStrategy.js');
require(__dirname + '/../lib/passport/TokenStrategy.js');
require(__dirname + '/../mailers/UserMailer.js');

var SessionsController = Class('SessionsController')({
  prototype : {
    /* Render login form for user
     * @method: login
     */
    login : function (req, res) {
      if (req.currentPerson) {
        req.flash('info', 'You must be logged out in order to perform the previous action.');
        return res.redirect('/');
      }

      res.render('sessions/login.html', {layout : 'login'});
    },

    /* Render forgot password form
     * @method: forgotPassword
     */
    forgotPassword : function forgotPassword(req, res, next) {
      if (req.currentPerson) {
        req.flash('info', 'You must be logged out in order to perform the previous action.');
        return res.redirect('/');
      }

      res.format({
        html : function() {
          if (req.method === 'GET') {
            return res.render('sessions/forgotPassword.html', {layout : 'login'})
          } else if (req.method === 'POST') {
            User.find({email : req.body.email, deleted: false}, function(err, user) {
              if (err) {
                return next(err);
              }

              if (user.length === 0) {
                return next(new NotFoundError('Email not found.'));
              }

              user = new User(user[0]);

              user.token = bcrypt.hashSync(CONFIG.sessionSecret + Date.now(), bcrypt.genSaltSync(12), null);

              user.save(function(err, result) {
                if (err) {
                  return next(err);
                }

                UserMailer.forgotPassword(user, function(err, mailerResult) {
                  req.flash('success', 'Check your email to reset your password.');
                  res.redirect('/');
                });
              })
            });
          }
        }
      })
    },

    resetPassword : function resetPassword(req, res, next) {
      if (!req.currentPerson) {
        req.flash('info', 'You must be logged in in order to perform the previous action.');
        return res.redirect('/');
      }

      res.format({
        html : function() {

          var user = new User(req.user);

          user.password = req.body.password;

          user.encryptedPassword = null;

          user.save(function(err, result) {
            if (err) {
              return next(err);
            }

            UserMailer.passwordReset(user, function (err, mailerResult) {
              req.flash('success', 'Your password has been reset.');
              return res.redirect('/');
            });
          })
        }
      })
    },

    // email confirmation thingy
    /* Create session if token authentication is correct
     * @method: tokenAuth
     */
    tokenAuth : function tokenAuth(req, res, next) {
      if (req.currentPerson) {
        req.flash('info', 'You must be logged out in order to perform the previous action.');
        return res.redirect('/');
      }

      passport.authenticate('token', function(err, user, info) {
        if (err) {
          return next(err);
        }

        if (!user) {
          req.flash('error', 'Invalid email/profile name or Password!');
          return res.redirect('/login');
        }

        var newUser = new User(user);

        newUser.token = null;

        newUser.save(function(err, result) {
          if (err) {
            return next(err);
          }

          req.logIn(user, function (err) {
            if (err) { return next(err); }

            req.session.isAnonymous = false;

            if (req.query.reset) {
              req.flash('success', 'Welcome to CrowdVoice.by.');
              return res.render('sessions/resetPassword.html', {layout : 'login'});
            } else {
              req.flash('success', 'Welcome to CrowdVoice.by.');
              return res.redirect('/');
            }
          });
        })
      })(req, res, next);
    },

    // login
    /* Create session if authentication is correct
     * @method: create
     */
    create : function (req, res, next) {
      if (req.currentPerson) {
        req.flash('info', 'You must be logged out in order to perform the previous action.');
        return res.redirect('/');
      }

      passport.authenticate('local', function (err, user, info) {
        if (err) {
          return next(err);
        }

        if (!user || user.deleted) {
          req.flash('error', 'Invalid email/profile name or Password!');
          return res.redirect('/login');
        }

        if (user.token !== null) {
          req.flash('error', 'You need to activate your Account first.');
        }

        req.logIn(user, function (err) {
          if (err) { return next(err); }

          if (req.body.rememberme) {
            var expires;

            expires =  new Date(Date.now() + 3600000 * 24 * 365); //Add one more year

            req.session.cookie.expires = expires;
          }

          req.session.isAnonymous = false;

          req.flash('success', 'Welcome to CrowdVoice.by.');
          return res.redirect('/');
        });
      })(req, res, next);
    },

    /* Destroy user session
     * @method logout
     */
    logout : function (req, res) {
      if (!req.currentPerson) {
        req.flash('info', 'You must be logged in in order to perform the previous action.');
        return res.redirect('/');
      }

      req.logout();
      return res.redirect('/');
    },

    /* Switch between person and anonymous and viceversa
     * @method switchPerson
     */
    switchPerson : function switchPerson(req, res, next) {
      if (!req.currentPerson) {
        req.flash('info', 'You must be logged in in order to perform the previous action.');
        return res.redirect('/');
      }

      if (!req.currentPerson.isAnonymous) {
        req.session.isAnonymous = true;
      } else {
        req.session.isAnonymous = false;
      }

      res.redirect(req.session.backURL);
    }
  }
});

module.exports = new SessionsController();
