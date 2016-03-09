var BlackListFilter = require(__dirname + '/BlackListFilter');
var VoicesPresenter = require(path.join(process.cwd(), '/presenters/VoicesPresenter.js'));
var FeedPresenter = require(__dirname + '/../presenters/FeedPresenter.js');
var isProfileNameAvailable = require(path.join(__dirname, '../lib/util/isProfileNameAvailable.js'))

var EntitiesController = Class('EntitiesController').includes(BlackListFilter)({

  prototype : {
    getEntityByProfileName : function (req, res, next) {
      if (req.url.match(/^(\/anonymous\/?)/)) {
        var anonEntity = new Entity({
          id: 0,
          type: 'person',
          name: 'Anonymous',
          profileName: 'anonymous',
          isAnonymous: true,
          description : 'Anonymous user',
          location : 'No location',
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: false,
        });

        req.entity = anonEntity;
        req.entityType = 'Person';
        res.locals.Person = anonEntity;

        return next();
      } else {
        Entity.find({
          'profile_name' : req.params.profile_name
        }, function (err, result) {
          if (err) { return next(err); }

          if (result.length === 0) {
            return next(new NotFoundError('Entity Not Found'));
          }

          EntitiesPresenter.build(result, req.currentPerson, function(err, entities) {
            if (err) {
              return next(err);
            }

            req.entity = entities[0];
            req.entityType = req.entity.type;
            res.locals[req.entityType] = entities[0];
            return next();
          })
        });
      }
    },

    getEntity : function getEntity (req, res, next) {
      Entity.find({
        id: req.params.id,
        type: req.entityType
      }, function (err, result) {
        if (err) { next(err); return; }
        if (result.length === 0) {
          next(new NotFoundError('Entity Not Found')); return;
        }

        res.locals[req.entityType] = new Entity(result[0]);
        req.entity = new Entity(result[0]);

        next();
      });
    },

    index : function index(req, res, next) {
      Entity.find({ type:req.entityType }, function (err, result) {
        if (err) { next(err); return; }

        if (result.length === 0) {
          next(new NotFoundError('Entity Not Found')); return;
        }

        res.format({
          'text/html': function () {
            res.locals[inflection.pluralize(req.entityType)] = result;
            res.render(req.entityType + '/index.html', {});
          },
          'application/json': function () {
            res.json(result);
          }
        });
      });
    },

    show : function show (req, res, next) {
      res.render(inflection.pluralize(req.entityType) + '/show.html');
    },

    edit : function edit(req, res, next) {
      ACL.isAllowed('edit', 'entities', req.role, {
        entity : req.entity,
        currentPerson : req.currentPerson
      }, function(err, response) {
        if (err) {
          return next(err);
        }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        res.locals.checkit = Checkit;
        res.locals.currentUser = req.user;

        async.series([
          // Notification Settings
          function (nextSeries) {
            NotificationSetting.find({ entity_id: hashids.decode(req.entity.id)[0] }, function (err, settings) {
              if (err) { return next(err); }

              var setting = {
                webSettings: settings[0].webSettings,
                emailSettings: settings[0].emailSettings,
              }

              res.locals.notificationSettings = setting;

              return nextSeries();
            })
          },

          function (nextSeries) {
            if (req.entity.type !== 'organization') {
              return nextSeries();
            }

            EntityMembership.find({
              entity_id: hashids.decode(req.entity.id)[0]
            }, function (err, result) {
              if (err) { return nextSeries(err); }

              var memberIds = result.map(function (item) { return item.memberId; });

              Entity.whereIn('id', memberIds, function (err, result) {
                if (err) { return next(err); }

                EntitiesPresenter.build(result, req.currentPerson, function (err, members) {
                  if (err) { return next(err); }

                  res.locals.members = members;

                  return nextSeries();
                });
              });
            });
          }
        ], function (err) {
          if (err) { return next(err); }

          res.render(inflection.pluralize(req.entityType) + '/edit.html');
        });

      });
    },

    // update profile (as opposed to user account)
    update : function update(req, res, next) {
      ACL.isAllowed('update', 'entities', req.role, {
        entity : req.entity,
        currentPerson : req.currentPerson
      }, function(err, response) {
        if (err) {
          return next(err);
        }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        Entity.find({ id : hashids.decode(req.entity.id)[0] }, function(err, result) {
          if (err) {
            return next(err);
          }

          var entity = new Entity(result[0]);

          var pathToPublic = path.join(__dirname, '../public');

          entity.setProperties({
            name: req.body.name || entity.name,
            profileName: req.body.profileName || entity.profileName,
            description: req.body.description || '',
            location: req.body.location || ''
          });

          async.series([
            function (done) {
              entity.save(done);
            },
            function (done) {
              if (!req.files.image) { return done(); }
              entity.uploadImage('image', req.files.image.path, function(err) {
                if (err) { return done(err); }

                FeedInjector().inject(hashids.decode(req.currentPerson.id)[0], 'item entityUpdatesAvatar', entity, done);
              });
            },
            function (done) {
              if (!req.files.background) { return done(); }
              entity.uploadImage('background', req.files.background.path, function(err) {
                if (err) { return done(err); }

                FeedInjector().inject(hashids.decode(req.currentPerson.id)[0], 'item entityUpdatesBackground', entity, done);
              });
            },
            // Delete image
            function(done) {
              if (req.body.image && req.body.image === 'undefined') {
                entity.imageBaseUrl = null;
                entity.imageMeta = {};
              }

              done();
            },
            // Delete background
            function(done) {
              if (req.body.background && req.body.background === 'undefined') {
                entity.backgroundBaseUrl = null;
                entity.backgroundMeta = {};
              }

              done();
            },
            function(done) {
              entity.save(done);
            }
          ], function (err) {
            if (err) {
              res.format({
                html: function() {
                  res.locals.errors = err;
                  req.errors = err;
                  logger.info(err);
                  res.render(inflection.pluralize(req.entityType) + '/edit.html');
                },
                json: function() {
                  res.json({
                    status : 'error',
                    errors : err
                  });
                }
              });
            } else {
              res.format({
                html: function() {
                  req.flash('success', 'Your profile has been updated.');
                  res.redirect('/' + entity.profileName + '/edit');
                },
                json: function() {
                  res.json({status : 'success'});
                }
              });
            }
          });
        });
      });
    },

    // update user account (as opposed to profile)
    updateUser : function updateUser(req, res, next) {
      var entity = req.entity;

      ACL.isAllowed('updateUser', 'entities', req.role, {
        entity : entity,
        currentPerson : req.currentPerson
      }, function (err, response) {
        if (err) {
          return next(err);
        }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        var user = new User(req.user);

        if (req.body.email){
          var email = req.body.email.toLowerCase().trim();

          if (email && email !== '') {
            user.email = email;
          }
        }

        if (req.body.password) {
          var password = req.body.password;

          if (password && password !== '') {
            user.password = password;
          }
        }

        user.save(function(err, result) {
          if (err) {
            res.format({
              html: function() {
                res.locals.errors = err;
                req.errors = err;
                logger.info(err);
                res.render(inflection.pluralize(req.entityType) + '/edit.html');
              },
              json: function() {
                res.json({
                  status : 'error',
                  errors : err
                });
              }
            });
          } else {
            res.format({
              html: function() {
                req.flash('success', 'Your account details have been updated.');
                res.redirect('/' + entity.profileName + '/edit');
              },
              json: function() {
                res.json({status : 'success'});
              }
            });
          }
        });
      });
    },

    follow : function follow(req, res, next) {
      ACL.isAllowed('followAs', 'entities', req.role, {
        currentPersonId: req.currentPerson.id,
        followerId: req.body.followerId
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError('not owner of provided entity'));
        }

        Entity.findById(hashids.decode(req.body.followerId)[0], function (err, followers) {
          if (err) { return next(err); }

          var entity = new Entity(req.entity),
            follower = new Entity(followers[0]);
          entity.id = hashids.decode(entity.id)[0];

          // we don't want to allow the user to follow if he is anonymous
          if (follower.isAnonymous) {
            return next(new ForbiddenError('Anonymous users can\'t follow'));
          }

          EntityFollower.find({
            follower_id: follower.id,
            followed_id: entity.id
          }, function(err, result) {
            if (err) { return next(err); }

            if (result.length > 0) { // already following?
              // unfollow
              follower.unfollowEntity(entity, function(err) {
                if (err) { return next(err); }

                res.format({
                  html: function() {
                    req.flash('success', 'Unfollowed successfully.');
                    res.redirect('/' + entity.profileName);
                  },
                  json: function() {
                    res.json({
                      status: 'unfollowed',
                      entity: { id: follower.id }
                    });
                  }
                });
              });
            } else {
              var entityFollowerRecordId,
                entityFollowerRecord;

              async.series([
                // follow and respond to front end
                function (next) {
                  follower.followEntity(entity, function (err, recordId) {
                    if (err) { return next(err); }

                    entityFollowerRecordId = recordId[0];

                    res.format({
                      html: function() {
                        req.flash('success', 'Followed ' + entity.type + ' successfully.');
                        res.redirect('/' + entity.profileName);
                      },
                      json: function() {
                        res.json({
                          status: 'followed',
                          entity: { id: follower.id }
                        });
                      }
                    });

                    return next();
                  });
                },

                // get follower info
                function (next) {
                  EntityFollower.findById(entityFollowerRecordId, function (err, entityFollower) {
                    if (err) { next(err); }

                    entityFollowerRecord = entityFollower[0];

                    return next();
                  });
                },

                // feed
                function (next) {
                  FeedInjector().inject(follower.id, 'who entityFollowsEntity', entityFollowerRecord, next);
                },

                // notifications
                function (next) {
                  FeedInjector().injectNotification(follower.id, 'notifNewEntityFollower', entityFollowerRecord, next);
                },
              ], function (err) {
                if (err) {
                  logger.error(err);
                  logger.error(err.stack);
                }
              });
            }
          });
        });
      });
    },

    voices : function voices(req, res, next) {
      var entity = req.entity;
      Voice.find({
        owner_id : hashids.decode(entity.id)[0],
        status : Voice.STATUS_PUBLISHED
      }, function(err, result) {
        if (err) { next(err); return; }

        VoicesPresenter.build(result, req.currentPerson, function(err, voices) {
          if (err) {
            return next(err);
          }

          res.format({
            json: function () {
              res.send(voices);
            },
            html: function () {
              next(new Error('Not found'));
            }
          });
        });
      });
    },

    followers : function followers(req, res, next) {
      var entity = req.entity;
      var followerIds = [];

      async.series([function(done) {
        EntityFollower.find({ 'followed_id' : hashids.decode(entity.id)[0] }, function(err, result) {
          if (err) {
            return done(err);
          }

          followerIds = result.map(function(item) {
            return item.followerId;
          });

          done();
        });
      }], function(err) {
        if (err) {
          return next(err);
        }

        Entity.whereIn('id', followerIds, function(err, result) {
          if (err) {
            return next(err);
          }

          EntitiesPresenter.build(result, req.currentPerson, function(err, followers) {
            if (err) {
              return next(err);
            }

            res.json(followers);
          });
        });
      });
    },

    voicesFollowed : function voicesFollowed(req, res, next) {
      VoiceFollower.find({ 'entity_id' : hashids.decode(req.entity.id)[0] }, function(err, voicesFollowed) {
        if (err) {
          return next(err);
        }

        var followedIds = voicesFollowed.map(function(item) {
          return item.voiceId;
        });

        Voice.whereIn('id', followedIds, function(err, result) {
          if (err) {
            return next(err);
          }

          result = result.filter(function(item) {
            return item.status === Voice.STATUS_PUBLISHED
          })

          VoicesPresenter.build(result, req.currentPerson, function(err, voices) {
            if (err) {
              return next(err);
            }

            res.json(voices);
          });
        });
      });
    },

    entitiesFollowed : function entitiesFollowed(req, res, next) {
      EntityFollower.find({ 'follower_id' : hashids.decode(req.entity.id)[0] }, function(err, entitiesFollowed) {
        if (err) {
          return next(err);
        }

        var followedIds = entitiesFollowed.map(function(item) {
          return item.followedId;
        });

        Entity.whereIn('id', followedIds, function(err, result) {
          if (err) {
            return next(err);
          }

          EntitiesPresenter.build(result, req.currentPerson, function(err, entities) {
            if (err) {
              return next(err);
            }

            res.json(entities);
          });
        });
      });
    },

    recommended : function recommended(req, res, next) {
      var entity = req.entity;
      entity.recommendedVoices(function(err, voices) {
        if (err) { next(err); return; }
        res.format({
          'application/json': function() {
            res.json(voices);
          },
          'default': function() {
            next(new NotFoundError('Unknown format for this request'));
          }
        });
      });
    },

    isProfileNameAvailable : function isProfileNameAvailable(req, res, next) {
      ACL.isAllowed('isProfileNameAvailable', 'entities', req.role, {
        currentPerson : req.currentPerson,
        entity : req.entity
      }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        var value = req.body.value.toLowerCase().trim();
        var currentPersonId = hashids.decode(req.currentPerson.id)[0];

        if (value.match(BlackListFilter.routesBlackList[1])) {
          return res.json({ status : 'taken' });
        }

        Entity.find({
          profile_name: value
        }, function(err, result) {
          if (err) {
            return next(err);
          }

          if (result.length > 0) {
            return res.json({ status : 'taken' });
          } else {
            return res.json({ status : 'available' });
          }
        });
      });
    },

    isEmailAvailable : function isEmailAvailable(req, res, next) {
      ACL.isAllowed('isEmailAvailable', 'entities', req.role, {
        currentPerson : req.currentPerson,
        entity : req.entity
      }, function(err, response) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        var value = req.body.value.toLowerCase().trim();
        var currentUserId = req.user.id;

        User.find(['email = ? AND id != ?', [value, currentUserId]], function(err, result) {
          if (err) {
            return next(err);
          }

          if (result.length > 0) {
            return res.json({ status : 'taken' });
          } else {
            return res.json({ status : 'available' });
          }
        })
      });
    },

    isVoiceSlugAvailable : function isVoiceSlugAvailable(req, res, next) {
      ACL.isAllowed('isVoiceSlugAvailable', 'entities', req.role, {}, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        var value = req.body.value.toLowerCase().trim();

        if (value.search(' ') !== -1) {
          return res.json({ 'status' : 'taken' });
        }

        Slug.find({ url : value }, function(err, result) {
          if (err) {
            return next(err);
          }

          if (result.length === 0) {
            return res.json({ 'status' : 'available' });
          } else {
            return res.json({ 'status' : 'taken' });
          }
        })
      })
    },

    reportEntity : function (req, res, next) {
      // data.body = {
      //   message: <String>
      // }

      ACL.isAllowed('reportEntity', 'entities', req.role, {
        currentEntityId: req.entity.id,
        currentPersonId: req.currentPerson.id
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) { return res.json(response.status); }

        var threads = [],
          admins,
          report;

        async.series([
          // get the admins
          function (next) {
            Entity.find({ is_admin: true }, function (err, result) {
              if (err) { return next(err); }

              admins = result;

              next();
            });
          },

          // create or find message thread for all admins
          function (next) {
            var sender = new Entity({ id: hashids.decode(req.currentPerson.id)[0] });

            // iterate over admins
            async.each(admins, function (admin, next) {
              MessageThread.findOrCreate({
                senderPerson: sender,
                senderEntity: sender,
                receiverEntity: admin
              }, function (err, result) {
                if (err) { return next(err); }

                threads.push(result);

                next();
              });
            }, function (err) { // async.each
              if (err) { return next(err); }

              next();
            });
          },

          function (next) {
            report = new Report({
              reporterId: hashids.decode(req.currentPerson.id)[0],
              reportedId: hashids.decode(req.entity.id)[0]
            });

            report.save(next);
          },

          // go over threads and create a message for each admin
          function (next) {
            var senderId = hashids.decode(req.currentPerson.id)[0],
              receiverId;

            // go over the threads and create a message for each one
            async.each(threads, function (thread, next) {
              receiverId = hashids.decode(thread.receiverEntityId)[0];

              thread.createMessage({
                type: 'report',
                senderPersonId: senderId,
                senderEntityId: senderId,
                receiverEntityId: receiverId,
                message: req.body.message,
                reportId: report.id
              }, next);
            }, function (err) { // async.each
              if (err) { return next(err); }

              next();
            });
          }
        ], function (err) { // async.series
          if (err) { return next(err); }

          ThreadsPresenter.build(threads, req.currentPerson, function (err, result) {
            if (err) { return next(err); }

            res.json({ status: 'ok' });
          });
        });
      });
    },

    feed: function (req, res, next) {
      ACL.isAllowed('feed', 'entities', req.role, {
        entityProfileName: req.entity.profileName,
        currentPerson: req.currentPerson
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        var currentPerson,
          person = new Entity(req.currentPerson)
        person.id = hashids.decode(person.id)[0]

        person.owner(function (err, result) {
          if (err) { return next(err) }

          if (req.currentPerson.isAnonymous) {
            currentPerson = new Entity(result)
          } else {
            currentPerson = new Entity(person)
          }

          return res.format({
            html: function () {
              Promise.resolve()
                .then(function () {
                  return db('Notifications')
                    .count('*')
                    .where('follower_id', response.follower.id)
                    .andWhere('for_feed', true)
                    .then(function (count) {
                      res.locals.totalFeedItems = +count[0].count

                      return Promise.resolve()
                    })
                })
                .then(function () {
                  return db('Entities')
                    .select('name', 'profile_name')
                    .where('profile_name', req.params.profileName)
                    .then(function (result) {
                      var entity = Argon.Storage.Knex.processors[0](result)

                      res.locals.entity = entity[0];

                      return Promise.resolve()
                    })
                })
                .then(function () {
                  return res.render('people/feed', {
                    pageName: 'page-people-feed page-inner'
                  })
                })
                .catch(next)
            },

            json: function () {
              db('Notifications')
                .select('*', function () {
                  this
                    .count('*')
                    .as('full_count')
                    .from('Notifications')
                    .where('follower_id', response.follower.id)
                    .andWhere('for_feed', true)
                })
                .from('Notifications')
                .where('follower_id', response.follower.id)
                .andWhere('for_feed', true)
                .orderBy('created_at', 'desc')
                .offset(req.query.offset || 0)
                .limit(req.query.limit || 50)
                .then(function (result1) {
                  var notifications = Argon.Storage.Knex.processors[0](result1)

                  return db('FeedActions')
                    .whereIn('id', notifications.map(function (n) { return n.actionId }))
                    .orderBy('created_at', 'desc')
                    .then(function (result2) {
                      var actions = Argon.Storage.Knex.processors[0](result2)

                      FeedPresenter.build(actions, req.currentPerson, function (err, pres) {
                        if (err) { return next(err) }

                        return res.json({
                          feedItems: pres,
                          totalCount: (result1[0] ? +result1[0].full_count : 0),
                        });
                      });
                    });
                })
                .catch(next);
            }
          });
        });
      });
    },

    home : function (req, res, next) {
      /* GET
       * req.query.page = Number of page
       */

      ACL.isAllowed('home', 'entities', req.role, {
        entityProfileName: req.entity.profileName,
        currentPerson: req.currentPerson
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        var page = req.query.page || 1,
          pageLength = 20;

        db.raw('SELECT *, ' +
          '(SELECT count(*) AS full_count ' +
          'FROM "Notifications" ' +
          'WHERE follower_id = ?) ' +
          'FROM "Notifications" ' +
          'WHERE follower_id = ? ' +
          'AND for_feed = ? ' +
          'ORDER BY created_at DESC ' +
          'LIMIT ? ' +
          'OFFSET ?', [response.follower.id, response.follower.id, true, pageLength, (page - 1) * pageLength])
          .asCallback(function (err, result) {
            if (err) { return next(err); }

            // no results, i.e. no notifications or a blank page
            if (result.rows.length < 1) {
              var empty = { feed: [], isThereNextPage: false };

              HomepageTopVoice.find({ active: true }, function (err, topVoices) {
                if (err) { return done(err); }

                if (topVoices.length < 1) {
                  res.locals.topVoice = null;
                  return res.format({
                    html: function () {
                      req.feed = empty;
                      res.locals.feed = empty;
                      res.render('people/home');
                    },
                    json: function () {
                      res.json(empty);
                    }
                  });
                }

                var topVoice = new HomepageTopVoice(topVoices[0]);

                delete topVoice.id;
                delete topVoice.voiceId;

                res.locals.topVoice = topVoice;

                Voice.find({ id: topVoices[0].voiceId }, function (err, voice) {
                  if (err) { return done(err); }

                  VoicesPresenter.build(voice, req.currentPerson, function (err, presented) {
                    if (err) { return done(err); }

                    res.locals.topVoice.voice = presented[0];

                    return res.format({
                      html: function () {
                        req.feed = empty;
                        res.locals.feed = empty;
                        res.render('people/home');
                      },
                      json: function () {
                        res.json(empty);
                      }
                    });
                  });
                });
              });
            } else {
              var notifications = Argon.Storage.Knex.processors[0](result.rows),
                actionIds = notifications.map(function (val) {
                  return val.actionId;
                }),
                totalPages = Math.ceil(result.rows[0].full_count / pageLength),
                isThereNextPage = page < totalPages;

              FeedAction.whereIn('id', actionIds, function (err, actions) {
                if (err) { return next(err); }

                FeedPresenter.build(actions, req.currentPerson, function (err, presentedFeed) {
                  if (err) { return next(err); }

                  var answer = {
                    feed: presentedFeed,
                    isThereNextPage: isThereNextPage
                  };

                  HomepageTopVoice.find({ active: true }, function (err, topVoices) {
                    if (err) { return done(err); }

                    if (topVoices.length < 1) {
                      res.locals.topVoice = null;
                      return res.format({
                        html: function () {
                          req.feed = answer;
                          res.locals.feed = answer;
                          res.render('people/home');
                        },
                        json: function () {
                          res.json(answer);
                        }
                      });
                    }

                    var topVoice = new HomepageTopVoice(topVoices[0]);

                    delete topVoice.id;
                    delete topVoice.voiceId;

                    res.locals.topVoice = topVoice;

                    Voice.find({ id: topVoices[0].voiceId }, function (err, voice) {
                      if (err) { return done(err); }

                      VoicesPresenter.build(voice, req.currentPerson, function (err, presented) {
                        if (err) { return done(err); }

                        res.locals.topVoice.voice = presented[0];

                        return res.format({
                          html: function () {
                            req.feed = answer;
                            res.locals.feed = answer;
                            res.render('people/home');
                          },
                          json: function () {
                            res.json(answer);
                          }
                        });
                      });
                    });
                  });
                });
              });
            }
          });
      });
    }
  }
});

module.exports = new EntitiesController();
