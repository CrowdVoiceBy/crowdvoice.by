var VoicesPresenter = require(path.join(process.cwd(), '/presenters/VoicesPresenter.js'));
var PostsPresenter = require(path.join(process.cwd(), '/presenters/PostsPresenter.js'));
var FeedPresenter = require(path.join(__dirname, '../presenters/FeedPresenter.js'));

var PeopleController = Class('PeopleController').inherits(EntitiesController)({
  prototype : {
    myVoices: function (req, res, next) {
      ACL.isAllowed('myVoices', 'entities', req.role, {
        currentEntity: req.entity,
        currentPerson: req.currentPerson
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        var ownerIds = [];
        var voices;

        async.series([function(done) {
          EntityOwner.find({
            owner_id : response.entity.id
          }, function(err, result) {
            if (err) {
              return done(err);
            }

            ownerIds = result.map(function(item) {
              return item.ownedId;
            });

            ownerIds.push(response.entity.id);

            done();
          })
        }, function(done) {
          // Get owner ids where I'm member of

          EntityMembership.whereIn('member_id', ownerIds, function(err, response) {
            if (err) {
              return done(err);
            }

            response.forEach(function(item) {
              ownerIds.push(item.entityId);
            });

            done();

          });
        }, function(done) {
          Voice.whereIn('owner_id', ownerIds, function(err, response) {
            if (err) {
              return done(err);
            }

            voices = response;

            done();
          });
        }, function(done) {
          // Get Voice IDs where I'm a collaborator
          VoiceCollaborator.whereIn('collaborator_id', ownerIds, function(err, response) {
            if (err) {
              return done(err);
            }

            var voicesIds = response.map(function(item) {
              return item.voiceId;
            });

            Voice.whereIn('id', voicesIds, function(err, response) {
              if (err) {
                return done(err);
              }

              response.forEach(function(item) {
                voices.push(item);
              });

              done();
            });
          });
        }], function(err) {
          if (err) {
            return next(err);
          }


          function alphabetical(a, b) {
            var A = a.title.toLowerCase();
            var B = b.title.toLowerCase();
            if (A < B) {
              return -1;
            } else if (A > B) {
              return  1;
            } else {
              return 0;
            }
          }

          voices = voices.sort(alphabetical);

          VoicesPresenter.build(voices, req.currentPerson, function (err, result) {
            if (err) { return next(err); }

            var endResult = {
              drafts: [],
              unlisted: [],
              published: [],
              archived: []
            };

            var voicesLength = result.length;

            result.forEach(function (val) {
              switch (val.status) {
                case 'STATUS_DRAFT':
                  endResult.drafts.push(val);
                  break;
                case 'STATUS_UNLISTED':
                  endResult.unlisted.push(val);
                  break;
                case 'STATUS_PUBLISHED':
                  endResult.published.push(val);
                  break;
                case 'STATUS_ARCHIVED':
                  endResult.archived.push(val);
                  break;
              };
            });

            res.format({
              html: function () {
                res.locals.voicesLength = voicesLength;
                res.locals.voices = endResult;
                res.render('people/myVoices');
              },
              json: function () {
                res.json(endResult);
              },
            });
          });
        });
      });
    },

    savedPosts : function savedPosts(req, res, next) {
      ACL.isAllowed('savedPosts', 'entities', req.role, {
        currentEntity : req.entity,
        currentPerson : req.currentPerson
      }, function(err, response) {
        if (err) {
          return next(err);
        }

        if (!response.isAllowed) {
          return next(new ForbiddenError);
        }

        SavedPost.find({ 'entity_id' : response.entity.id }, function(err, result) {
          if (err) { next(err); return; }

          var posts = [];

          async.each(result, function(sp, done) {
            var sp = new SavedPost(sp);
            sp.post(function(err, post) {
              posts.push(post);
              done();
            });
          }, function(err) {
            if (err) { next(err); return; }

            PostsPresenter.build(posts, req.currentPerson, function(err, result) {
              if (err) {
                return next(err);
              }

              res.format({
                html : function() {
                  res.locals.savedPosts = result;
                  res.render('people/savedPosts.html');
                },
                json : function() {
                  res.json(result);
                }
              });
            });
          });
        });
      });
    },

    getOrganizations : function getOrganizations(req, res, next) {
      var entity = req.currentPerson;
      var orgsMemberOf;
      var orgsOwnerOf;

      ACL.isAllowed('myVoices', 'entities', req.role, {
        currentEntity: req.entity,
        currentPerson: req.currentPerson
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError('Unauthorized.'));
        }

        async.series([
          function (done) {
            EntityMembership.find({ member_id: hashids.decode(entity.id)[0] }, function (err, result) {
              if (err) { return done(err); }

              var entityIds = result.map(function (val) {
                return val.entityId;
              })

              Entity.whereIn('id', entityIds, function (err, result) {
                if (err) { return done(err); }

                result = result.filter(function(item) {
                  if (item.type === 'organization') {
                    return true;
                  }
                });

                EntitiesPresenter.build(result, req.currentPerson, function (err, result) {
                  if (err) { return done(err); }

                  orgsMemberOf = result;
                  done();
                })
              })
            })
          },

          function (done) {
            EntityOwner.find({ owner_id: hashids.decode(entity.id)[0] }, function (err, result) {
              if (err) { return done(err); }

              var entityIds = result.map(function (val) {
                return val.ownedId;
              });

              Entity.whereIn('id', entityIds, function (err, result) {
                if (err) { return done(err); }

                result = result.filter(function(item) {
                  if (item.type === 'organization') {
                    return true;
                  }
                });

                EntitiesPresenter.build(result, req.currentPerson, function (err, result) {
                  if (err) { return done(err); }

                  orgsOwnerOf = result;

                  done();
                })
              })
            })
          }
        ], function (err) {
          if (err) { return next(err); }

          var result = orgsOwnerOf.concat(orgsMemberOf);

          res.json(result);
        });
      });
    }
  }
});

module.exports = new PeopleController();
