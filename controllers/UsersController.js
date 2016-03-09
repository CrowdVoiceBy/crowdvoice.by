require(__dirname + '/../mailers/UserMailer.js');

var UsersController = Class('UsersController')({
  prototype : {
    index : function index(req, res, next) {
      ACL.isAllowed('index', 'users', req.role, {}, function(err, isAllowed) {
        if (err) {
          return next(err)
        }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized'));
        }

        User.find({ deleted: false }, function(err, users) {
          res.render('users/index.html', {layout : 'application', users : users});
        });
      });
    },

    show : function show(req, res, next) {
      ACL.isAllowed('show', 'users', req.role, {}, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized'));
        }

        User.findById(req.params.id, function(err, result) {
          var user;

          if (err) { return next(err); }
          if (result.length === 0 || result[0].deleted) { return next(new NotFoundError('User Not found')); }

          user = new User(result[0]);
          res.render('users/show.html', {layout : 'application', user : user.toJson()});
        })

      })
    },

    new : function(req, res, next) {
      ACL.isAllowed('new', 'users', req.role, {
        currentPerson : req.currentPerson
      }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError('You need to logout first.'));
        }

        res.render('users/new.html', {layout : 'login', errors: null});
      });
    },

    create : function create(req, res, next) {
      ACL.isAllowed('create', 'users', req.role, {
        currentPerson : req.currentPerson
      }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError('You need to logout first'));
        }

        res.format({
          html : function() {

            var person, user, anonymous;

            async.series([function(done) {
              person = new Entity({
                type: 'person',
                name: req.body['profileName'].split('-').join(' '),
                profileName: req.body['profileName'],
                isAnonymous: false
              });

              person.save(function(err, result) {
                if (err) {
                  return done(err)
                }

                done()
              })
            }, function(done) {
              user = new User({
                entityId: person.id,
                email: req.body['email'],
                password: req.body['password']
              });

              user.save(function(err, result) {
                if (err) {
                  person.destroy(function(){});
                  return done(err);
                }

                done()
              })
            }, function(done) {
              anonymous = new Entity({
                type: 'person',
                name: 'Anonymous',
                profileName: 'anonymous_' + hashids.encode(Date.now() + (person.id * 10000)),
                isAnonymous: true
              });

              anonymous.save(function(err, result) {
                if (err) {
                  person.destroy(function(){});
                  user.destroy(function(){});
                  return done(err);
                }

                done()
              })

            }, function(done) {
              var ownership = new EntityOwner({
                ownerId : person.id,
                ownedId : anonymous.id
              });

              ownership.save(function(err, result) {
                if (err) {
                  person.destroy(function(){});
                  user.destroy(function(){});
                  anonymous.destroy(function(){});
                  return done(err);
                }

                done();
              })
            }, function (done) {
              // NOTE: WHEN ADDING NEW FEED ACTIONS YOU NEED TO UPDATE THIS!!
              var defaults = {
                selfNewMessage: true,
                selfNewInvitation: true,
                selfNewRequest: true,
                selfNewVoiceFollower: true,
                selfNewEntityFollower: true
              }

              var setting = new NotificationSetting({
                entityId: person.id,
                webSettings: defaults,
                emailSettings: defaults
              });

              setting.save(function (err, result) {
                if (err) {
                  person.destroy(function () {});
                  user.destroy(function () {});
                  anonymous.destroy(function () {});
                  return done(err);
                }

                done();
              });
            }], function(err) {
              if (err) {
                req.flash('error', 'There was an error creating the user.');

                var errors = [];

                if (err.errors) {

                  Object.keys(err.errors).forEach(function(k) {
                    err.errors[k].errors.forEach(function(error) {
                      var obj = {}
                      obj[k] = error.message
                      errors.push(obj);
                    })
                  })
                } else {
                  var errors = err;
                }

                res.render('users/new.html', {layout: 'login', errors: errors});

                return;
              }

              UserMailer.new(user, person, function(err, result) {
                if (err) {
                  req.flash('error', 'There was an error sending the activation email.');
                  return res.redirect('/');
                }

                req.flash('success', 'Check your email to activate your account.');
                res.redirect('/');
              });

            });
          }
        });
      });
    },

    edit : function edit(req, res, next) {
      var userId = hashids.decode(req.params.id)[0];

      ACL.isAllowed('edit', 'users', req.role, {
        userId : userId
      }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError())
        }

        User.findById(userId, function (err, user) {
          if (err) { next(err); return; }
          if (user.length === 0 || user[0].deleted) { next(new NotFoundError('User Not found')); return; }

          res.render('users/edit.html', {layout : 'application', user: user[0]});
        });
      })
    },

    update : function update(req, res, next) {
      var userId = hashids.decode(req.params.id)[0];

      ACL.isAllowed('update', 'users', req.role, {
        userId : userId
      }, function(err, isAllowed) {
        if (err) {
          return next(err)
        }

        if (!isAllowed) {
          return next(new ForbiddenError())
        }

        User.findById(userId, function (err, result) {
          var user;

          if (err) { next(err); return; }
          if (result.length === 0 || result[0].deleted) { next(new NotFoundError('User Not found')); return; }

          user = new User(result[0]);
          user.setProperties(req.body);

          user.save(function (err, result) {
            if (err) { next(err); return; }

            req.flash('success', 'Updated user info successfully.');
            res.redirect('/user/' + req.params.id);
          });
        });
      })
    }
  }
});

module.exports = new UsersController();
