Admin.TopicsController = Class(Admin, 'TopicsController')({
  prototype : {
    index : function index(req, res, next) {
      ACL.isAllowed('index', 'admin.topics', req.role, { currentPerson: req.currentPerson }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        Topic.all(function(err, result) {
          if (err) {
            return next(err);
          }

          TopicsPresenter.build(result, function(err, topics) {
            if (err) {
              return next(err);
            }

            res.locals.topics = topics;

            res.render('admin/topics/index.html', { layout : 'admin' });
          });
        });
      });
    },

    show : function show(req, res, next) {
      ACL.isAllowed('show', 'admin.topics', req.role, { currentPerson: req.currentPerson }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        res.render('admin/topics/show.html', { layout : 'admin' });
      });

    },

    new : function(req, res, next) {
      ACL.isAllowed('new', 'admin.topics', req.role, { currentPerson: req.currentPerson }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        res.render('admin/topics/new.html');
      });
    },

    create : function create(req, res, next) {
      ACL.isAllowed('create', 'admin.topics', req.role, { currentPerson: req.currentPerson }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        var topic = new Topic({
          name: req.body.name
        });

        async.series([
          function (done) {
            topic.save(done);
          },
          function (done) {
            if (!req.files['image']) { return done(); }
            topic.uploadImage('image', req.files['image'].path, function (err) {
              done(err);
            });
          },
          function (done) {
            topic.save(done);
          }
        ], function (err) {
          if (err) {
            res.locals.errors = err;
            res.render('admin//topics/new.html', { layout : 'admin' });
          } else {
            res.redirect('/admin/topics');
          }
        });

      });
    },

    edit : function edit(req, res, next) {
      ACL.isAllowed('edit', 'admin.topics', req.role, { currentPerson: req.currentPerson }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        Topic.find({ id : hashids.decode(req.params.topicId)[0] }, function(err, result) {
          if (err) {
            return next(err);
          }

          if (result.length === 0) {
            return next(new NotFoundError());
          }

          TopicsPresenter.build(result, function(err, topics) {
            if (err) {
              return next(err);
            }

            res.locals.topic = topics[0];

            res.render('admin/topics/edit.html', { layout : 'admin' });
          });
        });
      });
    },

    update : function update(req, res, next) {
      ACL.isAllowed('update', 'admin.topics', req.role, { currentPerson: req.currentPerson }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        Topic.find({ id : hashids.decode(req.params.topicId)[0] }, function(err, result) {
          if (err) {
            return next(err);
          }


          var topic = new Topic(result[0]);

          topic.name = req.body.name;
          topic.slug = req.body.slug;

          async.series([
            function (done) {
              if (!req.files['image']) { return done(); }
              topic.uploadImage('image', req.files['image'].path, done);
            },
            function (done) {
              topic.save(done);
            }
          ], function (errors) {
            if (errors) {
              TopicsPresenter.build([topic], function(err, topics) {
                res.locals.topic = topics[0];
                res.locals.errors = errors

                return res.render('admin/topics/edit.html', { layout : 'admin' });
              });
            } else {
              return res.redirect('/admin/topics');
            }
          });
        });
      });
    },

    destroy : function destroy(req, res, next) {
      ACL.isAllowed('destroy', 'admin.topics', req.role, { currentPerson: req.currentPerson }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        Topic.find({ id : hashids.decode(req.params.topicId)[0] }, function(err, result) {
          if (err) {
            return next(err);
          }

          if (result.length === 0) {
            return next(new NotFoundError());
          }

          var topic = new Topic(result[0]);

          topic.deleted = true;

          topic.save(function(err, result) {
            if (err) {
              return next(err);
            }

            req.flash('success', 'Topic deleted.');
            res.redirect('/admin/topics');
          });
        });

      });
    }
  }
});

module.exports = new Admin.TopicsController();
