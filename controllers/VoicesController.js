var BlackListFilter = require(__dirname + '/BlackListFilter');
var EntitiesPresenter = require(path.join(process.cwd(), '/presenters/EntitiesPresenter.js'));
var NotificationMailer = require(path.join(__dirname, '../mailers/NotificationMailer.js'));

require(path.join(process.cwd(), 'lib', 'krypton', 'presenters', 'VoicesPresenter.js'))

require(path.join(__dirname, '../lib/TwitterFetcher.js'));

var domain = require('domain');

var d = domain.create();

d.on('error', function(err) {
  logger.error('Voice Twitter Fetcher Error');
  logger.error(err);
  logger.error(err.stack);
});

var VoicesController = Class('VoicesController').includes(BlackListFilter)({
  POSTS_PER_PAGE : 50,

  prototype : {
    getActiveVoice : function(req, res, next) {
      Voice.findBySlug(req.params['voice_slug'], function(err, voice) {
        if (err) { return next(err); }

        res.locals.voice = new Voice(voice);
        req.activeVoice = new Voice(voice);

        res.locals.postsCount = {
          approved : {},
          unapproved : {}
        };

        var pagesForMonths = {
          approved: {},
          unapproved: {}
        }

        var postDates = {
          firstPostDate: null,
          lastPostDate: null
        };

        var fetchVoice;

        async.series([
          function(done) {
            db.raw("SELECT COUNT (*), \
              to_char(\"Posts\".published_at, 'MM') AS MONTH, \
              to_char(\"Posts\".published_at, 'YYYY') AS YEAR \
              FROM \"Posts\" \
              WHERE \"Posts\".voice_id = ? \
              AND \"Posts\".approved = true \
              GROUP BY MONTH, YEAR \
              ORDER BY YEAR DESC, MONTH DESC", [voice.id])
            .asCallback(function(err, postsCount) {
              if (err) { return done(err); }

              var counts = {};

              postsCount.rows.forEach(function(post) {
                if (!counts[post.year]) {
                  counts[post.year] = {};
                }

                counts[post.year][post.month] = post.count;
              });

              res.locals.postsCount.approved = counts;
              done();
            });
          },
          function(done) {
            db.raw("SELECT COUNT (*), \
              to_char(\"Posts\".published_at, 'MM') AS MONTH, \
              to_char(\"Posts\".published_at, 'YYYY') AS YEAR \
              FROM \"Posts\" \
              WHERE \"Posts\".voice_id = ? \
              AND \"Posts\".approved = false \
              GROUP BY MONTH, YEAR \
              ORDER BY YEAR DESC, MONTH DESC", [voice.id])
            .asCallback(function(err, postsCount) {
              if (err) { return done(err); }

              var counts = {};

              postsCount.rows.forEach(function(post) {
                if (!counts[post.year]) {
                  counts[post.year] = {};
                }

                counts[post.year][post.month] = post.count;
              });

              res.locals.postsCount.unapproved = counts;
              done();
            });
          }, function(done) {
            // Followers
            VoiceFollower.find({ 'voice_id' : voice.id }, function(err, voiceFollowers) {
              var followerIds = voiceFollowers.map(function(item) {
                return item.entityId;
              });

              Entity.whereIn('id', followerIds, function(err, result) {
                if (err) {
                  return done(err);
                }
                EntitiesPresenter.build(result, req.currentPerson, function(err, followers) {
                  if (err) {
                    return done(err);
                  }

                  res.locals.voice.followers = followers;

                  done();
                });
              });
            });
          }, function(done) {
            Slug.find(['voice_id = ? ORDER BY created_at DESC LIMIT 1', [req.activeVoice.id]], function(err, result) {
              if (err) {
                return done(err);
              }

              if (result.length === 0) {
                return done(new NotFoundError('Slug not found'));
              }

              req.voiceSlug = result[0];

              done();
            });
          }, function (next) {
            VoiceCollaborator.find({
              voice_id: req.activeVoice.id,
              is_anonymous: false
            }, function (err, collaborators) {
              if (err) { return next(err); }

              var ids = collaborators.map(function (val) { return val.collaboratorId; });

              Entity.whereIn('id', ids, function (err, entities) {
                if (err) { return next(err); }

                EntitiesPresenter.build(entities, req.currentPerson, function (err, presented) {
                  if (err) { return next(err); }

                  res.locals.contributors = presented;

                  return next();
                });
              });
            });
          }, function (next) {
            RelatedVoice.find({ voice_id: req.activeVoice.id }, function (err, related) {
              if (err) { return next(err); }

              var ids = related.map(function (val) { return val.relatedId });

              Voice.whereIn('id', ids, function (err, voices) {
                if (err) { return next(err); }

                VoicesPresenter.build(voices, req.currentPerson, function (err, presented) {
                  if (err) { return next(err); }

                  res.locals.relatedVoices = presented;

                  return next();
                });
              });
            });
          }, function(done) {

            K.Post.knex()
              .select(
                db.raw('distinct on (MONTH, YEAR) to_char("Posts".published_at, \'MM\') as MONTH'),
                db.raw('to_char("Posts".published_at, \'YYYY\') as YEAR'),
                db.raw('row_number() over (order by "Posts".published_at desc) / ? as page', VoicesController.POSTS_PER_PAGE)
              )
              .from('Posts')
              .where('Posts.voice_id', req.activeVoice.id)
              .andWhere('Posts.approved', true)
              .orderByRaw('YEAR desc, MONTH desc')
              .then(function (result) {
                var counts = {}

                async.each(result, function (row, doneEach) {
                  K.Post.query()
                    .count('*')
                    .where('voice_id', req.activeVoice.id)
                    .andWhere('approved', true)
                    .andWhere(db.raw('to_char("Posts".published_at, \'MM\') = ?', row.month))
                    .andWhere(db.raw('to_char("Posts".published_at, \'YYYY\') = ?', row.year))
                    .then(function (count) {
                      if (!counts[row.year]) {
                        counts[row.year] = {};
                      }

                      counts[row.year][row.month] = {
                        page: row.page,
                        count: (count[0] ? +count[0].count : 0)
                      };

                      return doneEach();
                    })
                    .catch(doneEach);
                }, function (err) {
                  if (err) { return done(err); }

                  pagesForMonths.approved = counts;

                  return done();
                });
              })
              .catch(done);
          }, function(done) {
            K.Post.knex()
              .select(
                db.raw('distinct on (MONTH, YEAR) to_char("Posts".published_at, \'MM\') as MONTH'),
                db.raw('to_char("Posts".published_at, \'YYYY\') as YEAR'),
                db.raw('row_number() over (order by "Posts".published_at desc) / ? as page', VoicesController.POSTS_PER_PAGE)
              )
              .from('Posts')
              .where('Posts.voice_id', req.activeVoice.id)
              .andWhere('Posts.approved', false)
              .orderByRaw('YEAR desc, MONTH desc')
              .then(function (result) {
                var counts = {}

                async.each(result, function (row, doneEach) {
                  K.Post.query()
                    .count('*')
                    .where('voice_id', req.activeVoice.id)
                    .andWhere('approved', false)
                    .andWhere(db.raw('to_char("Posts".published_at, \'MM\') = ?', row.month))
                    .andWhere(db.raw('to_char("Posts".published_at, \'YYYY\') = ?', row.year))
                    .then(function (count) {
                      if (!counts[row.year]) {
                        counts[row.year] = {};
                      }

                      counts[row.year][row.month] = {
                        page: row.page,
                        count: (count[0] ? +count[0].count : 0)
                      };

                      return doneEach();
                    })
                    .catch(doneEach);
                }, function (err) {
                  if (err) { return done(err); }

                  pagesForMonths.unapproved = counts;

                  return done();
                });
              })
              .catch(done);
          }, function(done) {
            K.Post.query()
              .where('voice_id', req.activeVoice.id)
              .andWhere('approved', true)
              .orderBy('published_at', 'asc')
              .limit(1)
              .then(function (post) {
                if (post.length > 0) {
                  postDates.firstPostDate = post[0].publishedAt;
                }

                return done();
              })
              .catch(done);
          }, function(done) {
            K.Post.query()
              .where('voice_id', req.activeVoice.id)
              .andWhere('approved', true)
              .orderBy('published_at', 'desc')
              .limit(1)
              .then(function (post) {
                if (post.length > 0) {
                  postDates.lastPostDate = post[0].publishedAt;
                }

                return done();
              })
              .catch(done);
          }, function(done) {
            K.Voice.query()
              .where('id', req.activeVoice.id)
              .include('owner')
              .then(function (voice) {
                fetchVoice = voice[0];

                return done();
              })
              .catch(done);
          }], function(err) {
            if (err) {
              return next(err);
            }

            res.locals.pagesForMonths = pagesForMonths;
            res.locals.voice.firstPostDate = postDates.firstPostDate;
            res.locals.voice.lastPostDate = postDates.lastPostDate;
            res.locals.owner = fetchVoice.owner;

            next();
          });
      });
    },

    index : function index(req, res, next) {
      var query = {
        ownerId: req.body.ownerId,
        topics: req.body.topics,
        createdBefore: req.body.createdBefore,
        createdAfter: req.body.createdAfter
      };

      Voice.filterBy(query, function(err, result) {
        if (err) { return next(err); }

        res.format({
          html : function() {
            res.locals.voices = result;
            res.render('voices/index.html');
          },
          json : function() {
            res.json(result);
          }
        });
      });
    },

    show : function show(req, res, next) {
      ACL.isAllowed('show', 'voices', req.role, {
        currentPerson : req.currentPerson,
        voice : res.locals.voice,
        profileName : req.params.profileName || 'anonymous'
      }, function(err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        res.locals.allowPosting = response.allowPosting;
        res.locals.allowPostEditing = response.allowPostEditing;

        res.format({
          html: function() {

            Promise.resolve()
              .then(function () {
                return K.VoicesPresenter.build([res.locals.voice], req.currentPerson)
                  .then(function (pres) {
                    res.locals.voice = pres[0];

                    return Promise.resolve();
                  });
              })
              .then(function () {

                return res.render('voices/show.html', {
                  pageName : 'page-inner page-voice'
                });
              })
              .catch(next);
          }
        });
      });
    },

    // not in use
    new : function(req, res) {
      res.render('voices/new.html', { errors: null });
    },

    create: function (req, res, next) {
      ACL.isAllowed('create', 'voices', req.role, {
        currentPerson : req.currentPerson,
        ownerId : req.params.ownerId
      }, function(err, response) {
        if (err) {
          return next(err);
        }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        var publishErrors = [];

        if (req.body.status === Voice.STATUS_PUBLISHED
          || req.body.status === Voice.STATUS_UNLISTED) {

          publishErrors.push('Voice does not have 20 posts.');

          if (!req.files.image) {
            publishErrors.push('Voices does not have a background image.');
          }
        }

        if (publishErrors.length > 0) {
          return res.status(403).json({ errors: publishErrors })
        }

        var voice = new Voice({
          title: req.body.title,
          status: req.body.status,
          description: req.body.description,
          type: req.body.type,
          ownerId: hashids.decode(req.body.ownerId)[0],
          twitterSearch: req.body.twitterSearch,
          rssUrl: req.body.rssUrl,
          locationName : req.body.locationName,
          latitude: req.body.latitude,
          longitude: req.body.longitude
        });

        async.series([function(done) {
          // anonymous

          if (req.currentPerson.isAnonymous) {
            voice.ownerId = hashids.decode(req.currentPerson.id)[0]
            return done();
          }

          if (req.body.anonymously !== 'true') {
            return done();
          }

          Entity.find({
            id : hashids.decode(req.currentPerson.id)[0]
          }, function(err, result) {
            if (err) {
              return done(err);
            }

            var person = new Entity(result[0]);

            person.getAnonymousEntity(function(err, result) {
              if (err) {
                return done(err);
              }

              voice.ownerId = result.id;

              done();
            });
          });
        }, function(done) {
          voice.save(done);
        }, function(done) {
          voice.addSlug(req.body.slug, function(err) {
            if (err) {
              return done(err);
            }

            done();
          });
        }, function(done) {
          if (!req.files.image || req.files.images === 'undefined') {
            return done();
          }

          voice.uploadImage('image', req.files.image.path, done);
        }, function(done) {
          voice.save(done);
        }, function(done) {
          req.body.topics = req.body.topics.split(',');

          async.each(req.body.topics, function(topic, nextTopic) {
            var voiceTopic = new VoiceTopic({
              voiceId : voice.id,
              topicId : hashids.decode(topic)[0]
            });

            voiceTopic.save(nextTopic);
          }, done);

        }], function(err) {
          if (err) {
            logger.error(err);

            return voice.destroy(function() {
              Slug.find({ 'voice_id' : voice.id }, function(error, result) {
                var slug = new Slug(result[0]);
                slug.destroy(function() {
                  return next(err);
                });
              });
            });
          }


          // Load tweets in the background
          if (voice.twitterSearch) {
            d.run(function() {
              var tf = new TwitterFetcher({
                voice : voice,
                count : 100
              });


              async.series([function(done) {
                logger.info('Fetching Tweets');
                tf.fetchTweets(done);
              }, function(done) {
                logger.info('Creating posts from tweets');
                tf.createPosts(done);
              }, function(done) {
                logger.info('Updating voice');
                var voiceInstance = new Voice(voice);
                voiceInstance.tweetLastFetchAt = new Date(Date.now());

                voiceInstance.save(function(err, result) {
                  logger.info('Updated Voice.tweetLastFetchAt');
                  done();
                });
              }], function(err) {
                if (err) {
                  logger.error('Error fetching tweets');
                  logger.error(err)
                  logger.error(err.stack);
                }

                logger.info('Finished Fetching tweets and saving posts.')
              });

            });
          }

          VoicesPresenter.build([voice], req.currentPerson, function(err, voices) {
            if (err) {
              return next(err);
            }

            FeedInjector().inject(voice.ownerId, 'who voiceIsPublished', voice, function (err) {
              if (err) { return next(err); }

              res.json(voices[0]);
            });
          });
        });
      });
    },

    edit : function edit(req, res, next) {
      ACL.isAllowed('edit', 'voices', req.role, {
        currentPerson : req.currentPerson,
        voice : req.activeVoice
      }, function(err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError('Unauthorized.'));
        }

        return res.render('voices/edit.html', { errors: null });
      });
    },

    update : function update(req, res, next) {
      ACL.isAllowed('update', 'voices', req.role, {
        currentPerson : req.currentPerson,
        voice : req.activeVoice
      }, function(err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        var voice = new Voice(req.activeVoice),
          oldTitle = req.activeVoice.title,
          oldDescription = req.activeVoice.description,
          oldStatus = req.activeVoice.status,
          publishErrors = [];

        // This is here so that fields that can be empty (like locationName or
        // twitterSearch) CAN be empty.
        var useDefault = function (newVal, oldVal) {
          if (_.isUndefined(newVal) || newVal === 'undefined') {
            return oldVal
          } else {
            return newVal
          }
        };

        voice.title = useDefault(req.body.title, voice.title);
        voice.status = useDefault(req.body.status, voice.status);
        voice.description = useDefault(req.body.description, voice.description);
        voice.type = useDefault(req.body.type, voice.type);
        voice.twitterSearch = useDefault(req.body.twitterSearch, voice.twitterSearch);
        voice.rssUrl = useDefault(req.body.rssUrl, voice.rssUrl);
        voice.locationName = useDefault(req.body.locationName, voice.locationName);
        voice.latitude = useDefault(req.body.latitude, voice.latitude);
        voice.longitude = useDefault(req.body.longitude, voice.longitude);

        // Check some requirements before being published
        async.series([

          // From anonymous to known
          function(nextSeries) {
            if (req.body.anonymously === 'true') {
              return nextSeries();
            }

            Entity.find({
              id : voice.ownerId
            }, function(err, result) {
              if (err) {
                return nextSeries(err);
              }

              var voiceOwner = new Entity(result[0]);

              if (!voiceOwner.isAnonymous) {
                return nextSeries();
              }

              voice.ownerId = hashids.decode(req.body.ownerId)[0];

              voice.save(function(err, result) {
                return nextSeries(err);
              });
            });
          },

          // 20 posts
          function (nextSeries) {
            if (req.body.status !== Voice.STATUS_PUBLISHED
              && req.body.status !== Voice.STATUS_UNLISTED) {

              return nextSeries();
            }

            Post.find({
              voice_id: voice.id,
              approved: true
            }, function (err, posts) {
              if (err) { return nextSeries(err); }

              if (posts.length < 20) {
                publishErrors.push('Voice does not have 20 posts.');
              }

              return nextSeries();
            });
          },

          // Background image
          function (nextSeries) {
            if (req.body.status !== Voice.STATUS_PUBLISHED
              && req.body.status !== Voice.STATUS_UNLISTED) {

              return nextSeries();
            }

            if (voice.imageBaseUrl.length === 0 && !req.files.image) {
              publishErrors.push('Voice does not have a background image.');
            }

            return nextSeries();
          },

          // Can't change to draft once PUBLISHED or UNLISTED
          function (nextSeries) {
            if (req.activeVoice.status !== Voice.STATUS_PUBLISHED
              && req.activeVoice.status !== Voice.STATUS_UNLISTED) {

              return nextSeries();
            }

            if (req.body.status === Voice.STATUS_DRAFT) {
              publishErrors.push('Voice cannot be a Draft once Published or Unlisted.');
            }

            return nextSeries();
          },
        ], function (err) {
          if (err) { return next(err); }

          if (publishErrors.length > 0) {
            return res.status(403).json({ errors: publishErrors });
          }

          async.series([function (done) {
            Entity.find({
              id: req.activeVoice.ownerId
            }, function (err, voiceOwner) {
              if (err) { return done(err); }

              if (voiceOwner[0].isAnonymous) {
                return done();
              }

              if (req.body.ownerId) {
                voice.ownerId = hashids.decode(req.body.ownerId)[0];
              }

              return done();
            });
          }, function(done) {
            if (!req.files.image) {
              return done();
            }

            voice.uploadImage('image', req.files.image.path, done);
          }, function(done) {
            if (req.body.slug === req.voiceSlug.url) {
              return done();
            }

            if (!req.body.slug) {
              return done();
            }

            voice.addSlug(req.body.slug, done);
          }, function(done) {
            voice.save(done);
          }, function(done) {
            if (!req.body.topics) {
              return done();
            }

            req.body.topics = req.body.topics.split(',');

            db('VoiceTopic').where({
              'voice_id' : voice.id
            }).del().asCallback(function(err, result) {
              if (err) {
                return done(err);
              }

              async.each(req.body.topics, function(topic, nextTopic) {
                var voiceTopic = new VoiceTopic({
                  voiceId : voice.id,
                  topicId : hashids.decode(topic)[0]
                });

                voiceTopic.save(nextTopic);
              }, done);
            });
          }, function(done) {
            if (req.body.title !== oldTitle) {
              FeedInjector().inject(voice.ownerId, 'item voiceNewTitle', voice, done);
            } else {
              return done();
            }
          }, function(done) {
            if (req.body.description !== oldDescription) {
              FeedInjector().inject(voice.ownerId, 'item voiceNewDescription', voice, done);
            } else {
              return done();
            }
          }, function (done) {
            if (req.body.status !== oldStatus && req.body.status === Voice.STATUS_PUBLISHED) {
              FeedInjector().inject(voice.ownerId, 'who voiceIsPublished', voice, done);
            } else {
              return done();
            }
          }, function (done) {
            if (req.body.status !== oldStatus && req.body.status === Voice.STATUS_ARCHIVED) {
              FeedInjector().inject(voice.ownerId, 'both entityArchivesVoice', voice, done);
            } else {
              return done();
            }
          }], function(err) {
            if (err) {
              return next(err);
            }

            // Load tweets in the background
            if (req.body.twitterSearch && req.body.twitterSearch !== '') {
              d.run(function() {
                var tf = new TwitterFetcher({
                  voice : voice,
                  count : 100
                });

                if (voice.twitterSearch !== null) {
                  async.series([function(done) {
                    logger.info('Fetching Tweets');
                    tf.fetchTweets(done);
                  }, function(done) {
                    logger.info('Creating posts from tweets');
                    tf.createPosts(done);
                  }, function(done) {
                    logger.info('Updating voice');
                    var voiceInstance = new Voice(voice);
                    voiceInstance.tweetLastFetchAt = new Date(Date.now());

                    voiceInstance.save(function(err, result) {
                      logger.info('Updated Voice.tweetLastFetchAt');
                      done();
                    });
                  }], function(err) {
                    if (err) {
                      logger.error('Error fetching tweets');
                      logger.error(err)
                      logger.error(err.stack);
                    }

                    logger.info('Finished Fetching tweets and saving posts.')
                  });
                }
              });
            }

            VoicesPresenter.build([voice], req.currentPerson, function (err, presentedVoice) {
              if (err) { return next(err); }

              req.flash('success', 'Voice has been updated.');
              res.json(presentedVoice[0]);
            });
          });
        });
      });
    },

    requestToContribute : function requestToContribute(req, res, next) {
      ACL.isAllowed('requestToContribute', 'voices', req.role, {
        currentPerson: req.currentPerson,
        activeVoice: req.activeVoice
      }, function(err, isAllowed) {
        if (err) {
          return next(err);
        }

        if (!isAllowed) {
          return next( new ForbiddenError() );
        }

        var thread,
          sender,
          receiver;

        async.series([
          // sender
          function (done) {
            sender = new Entity(req.currentPerson);
            sender.id = hashids.decode(req.currentPerson.id)[0];

            return done();
          },

          // receiver
          function (done) {
            Entity.find({
              id: req.activeVoice.ownerId
            }, function (err, owner) {
              if (err) { return done(err); }

              receiver = new Entity(owner[0]);

              return done();
            });
          },

          // thread
          function(done) {
            MessageThread.findOrCreate({
              senderPerson : sender,
              senderEntity : sender,
              receiverEntity : receiver
            }, function(err, result) {
              if (err) {
                return done(err);
              }

              thread = result;

              done();
            });
          },

          // message
          function(done) {
            thread.createMessage({
              type : 'request_voice',
              senderPersonId : sender.id,
              voiceId : req.activeVoice.id,
              message : req.body.message
            }, done);
          }
        ], function(err) {
          if (err) { return next(err); }

          ThreadsPresenter.build([thread], req.currentPerson, function(err, result) {
            if (err) { return next(err); }

            res.json(result[0]);
          });
        });
      });
    },

    destroy : function destroy(req, res, next) {
      ACL.isAllowed('edit', 'voices', req.role, {
        currentPerson : req.currentPerson,
        voice : req.activeVoice
      }, function(err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError('Unauthorized.'));
        }

        var voice = new Voice(req.activeVoice);
        voice.deleted = true;
        voice.save(function(err) {
          if (err) { return next(err); }

          req.flash('success', 'Voice has been deleted.');
          res.redirect('/voices');
        });
      });
    },

    fullDelete : function fullDelete(req, res, next) {
      ACL.isAllowed('delete', 'voices', req.role, {
        currentPerson : req.currentPerson,
        voice : req.activeVoice
      }, function(err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError('Unauthorized.'));
        }

        async.series([function(done) {
          db('Voices').where('id', req.activeVoice.id)
            .del().asCallback(function(err, result) {
              return done(err);
            });
        }, function(done) {
          db('Posts').where('voice_id', req.activeVoice.id)
            .del().asCallback(function(err, result) {
              return done(err);
            });
        }, function(done) {
          db('Slugs').where('voice_id', req.activeVoice.id)
            .del().asCallback(function(err, result) {
              return done(err);
            })
        }], function(err) {
          if (err) {
            return next(err);
          }

          req.flash('success', 'Voice has been deleted.');
          res.redirect('/');
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

          var follower = new Entity(followers[0]);

          // we don't want to allow the user to follow if he is anonymous
          if (follower.isAnonymous) {
            return next(new ForbiddenError('Anonymous users can\'t follow'));
          }

          // check if user is already following, if yes unfollow
          VoiceFollower.find({
            entity_id: follower.id,
            voice_id: req.activeVoice.id
          }, function (err, result) {
            if (err) { return next(err); }

            if (result.length > 0) { // we're following this voice
              // unfollow
              follower.unfollowVoice(req.activeVoice, function (err) {
                if (err) { return next(err); }

                res.format({
                  html: function () {
                    req.flash('success', 'Voice has been unfollowed.');
                    res.redirect('/' + req.params.profileName + '/' + req.params.voice_slug)
                  },
                  json: function () {
                    res.json({
                      status: 'unfollowed',
                      entity: { id: follower.id }
                    });
                  }
                });
              });
            } else {
              var voiceFollowerRecordId,
                voiceFollowerRecord;

              async.series([
                // follow and respond to front end
                function (next) {
                  follower.followVoice(req.activeVoice, function (err, recordId) {
                    if (err) { return next(err); }

                    voiceFollowerRecordId = recordId[0];

                    res.format({
                      html: function () {
                        req.flash('success', 'Voice has been followed.');
                        res.redirect('/' + req.params.profileName + '/' + req.params.voice_slug)
                      },
                      json: function () {
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
                  VoiceFollower.findById(voiceFollowerRecordId, function (err, voiceFollower) {
                    if (err) { next(err); }

                    voiceFollowerRecord = voiceFollower[0];

                    return next();
                  });
                },

                // generate feed and notifications
                function (next) {
                  FeedInjector().inject(follower.id, 'who entityFollowsVoice', voiceFollowerRecord, next);
                },

                function (next) {
                  FeedInjector().injectNotification(follower.id, 'notifNewVoiceFollower', voiceFollowerRecord, next);
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

    isVoiceSlugAvailable : function isVoiceSlugAvailable(req, res, next) {
      ACL.isAllowed('isVoiceSlugAvailable', 'voices', req.role, {
        currentPerson : req.currentPerson,
        voice : req.activeVoice
      }, function(err, response) {
        if (err) {
          return next(err);
        }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        var value = req.body.value.toLowerCase().trim();

        if (value.search(' ') !== -1) {
          return res.json({ 'status' : 'taken' });
        }

        Slug.find(['url = ?', [value]], function(err, result) {
          if (err) {
            return next(err);
          }

          if (result.length === 0) {
            return res.json({ 'status' : 'available' });
          } else {
            return res.json({ 'status' : 'taken' });
          }
        });

      });
    },

    inviteToContribute: function (req, res, next) {
      /*
       * req.body = {
       *   personId: hashids.encode,
       *   message: String,
       * }
       */

      ACL.isAllowed('inviteToContribute', 'voices', req.role, {
        currentPerson: req.currentPerson,
        voiceId: req.activeVoice.id
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError('Unauthorized.'));
        }

        VoiceCollaborator.find({
          voice_id: req.activeVoice.id,
          collaborator_id: hashids.decode(req.body.personId)[0]
        }, function (err, result) {
          if (err) { return next(err); }

          if (result.length > 0) {
            return res.json({ status: 'already collaborator' });
          }

          var thread,
            invited,
            invitationRequest,
            answer = {
              status: 'invited'
            };

          async.series([
            // get entity of invited
            function (next) {
              Entity.findById(hashids.decode(req.body.personId)[0], function (err, result) {
                if (err) { return next(err); }

                invited = result[0];

                return next();
              })
            },

            // get a thread
            function (next) {
              var currentPerson = new Entity(req.currentPerson);
              currentPerson.id = hashids.decode(currentPerson.id)[0];

              MessageThread.findOrCreate({
                senderPerson: currentPerson,
                senderEntity: response.owner,
                receiverEntity: invited
              }, function (err, result) {
                if (err) { return next(err); }

                thread = result;

                return next();
              });
            },

            // make or find invitation request
            function (next) {
              db('Messages')
                .where('thread_id', thread.id)
                .andWhere('sender_person_id', hashids.decode(req.currentPerson.id)[0])
                .andWhere('sender_entity_id', req.activeVoice.ownerId)
                .andWhere('receiver_entity_id', invited.id)
                .andWhere('type', 'not like', 'invitation_accepted%')
                .andWhere('type', 'not like', 'invitation_rejected%')
                .andWhere('invitation_request_id', 'is not', null)
                .andWhere(function () {
                  this
                    .where('voice_id', 'is not', null)
                    .andWhere('voice_id', '=', req.activeVoice.id)
                })
                .orderBy('created_at', 'desc')
                .asCallback(function (err, rows) {
                  if (err) { return next(err); }

                  var messages = Argon.Storage.Knex.processors[0](rows),
                    message = new Message(messages[0]);

                  if (messages.length < 1) {
                    invitationRequest = new InvitationRequest({
                      invitatorEntityId: response.owner.id,
                      invitedEntityId: invited.id
                    });

                    invitationRequest.save(next);
                  } else {
                    answer.status = 'already invited';

                    InvitationRequest.findById(message.invitationRequestId, function (err, invitation) {
                      if (err) { return next(err); }

                      invitationRequest = invitation[0];

                      message.destroy(next);
                    });
                  }
                });
            },

            // make invitation message
            function (next) {
              thread.createMessage({
                type: 'invitation_voice',
                senderPersonId: hashids.decode(req.currentPerson.id)[0],
                senderEntityId: req.activeVoice.ownerId,
                voiceId: response.voice.id,
                invitationRequestId: invitationRequest.id,
                message: req.body.message
              }, function (err, result) {
                if (err) { return next(err); }

                next();
              });
            },
          ], function (err) { // async.series
            if (err) { return next(err); }

            res.json(answer);
          });
        });
      });
    },

    removeContributor: function (req, res, next) {
      /*
       * req.body = {
       *   personId: hashids.encode
       * }
       */

      ACL.isAllowed('removeContributor', 'voices', req.role, {
        currentPerson: req.currentPerson,
        voiceId: req.activeVoice.id
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError('Unauthorized.'));
        }

        VoiceCollaborator.find({
          voice_id: req.activeVoice.id,
          collaborator_id: hashids.decode(req.body.personId)[0]
        }, function (err, result) {
          if (err) { return next(err); }

          if (result.length <= 0) {
            return res.json({ status: 'not collaborator' });
          } else {
            var contributorToRemove = new VoiceCollaborator(result[0]);

            contributorToRemove.destroy(function (err) {
              if (err) { return next(err); }

              res.json({ status: 'removed' });
            })
          }
        });
      });
    },

    archiveVoice: function (req, res, next) {
      ACL.isAllowed('archiveVoice', 'voices', req.role, {
        currentPerson: req.currentPerson,
        voiceId: req.activeVoice.id
      }, function (err, isAllowed) {
        if (err) { return next(err); }

        if (!isAllowed) {
          return next(new ForbiddenError('Unauthorized.'));
        }

        var voice = new Voice(req.activeVoice);

        voice.status = Voice.STATUS_ARCHIVED;

        voice.save(function (err) {
          if (err) { return next(err); }

          FeedInjector().inject(voice.ownerId, 'both entityArchivesVoice', voice, function (err) {
            if (err) { return next(err); }

            res.json({ status: 'archived' });
          });
        });
      });
    },

    addRelatedVoice: function (req, res, next) {
      /* POST
       * req.body = {
       *   relatedVoiceId: Hashids.encode
       * }
       */

      ACL.isAllowed('manageRelatedVoices', 'voices', req.role, {
        currentPerson: req.currentPerson,
        voiceId: req.activeVoice.id
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        RelatedVoice.find({
          voice_id: req.activeVoice.id,
          related_id: hashids.decode(req.body.relatedVoiceId)[0]
        }, function (err, relatedVoice) {
          if (err) { return next(err); }

          if (relatedVoice.length > 0) {
            return res.json({ status: 'already a related voice' });
          } else {
            var newRelation = new RelatedVoice({
              voiceId: req.activeVoice.id,
              relatedId: hashids.decode(req.body.relatedVoiceId)[0]
            });

            newRelation.save(function (err) {
              if (err) { return next(err); }

              return res.json({ status: 'added related voice' });
            });
          }
        });
      });
    },

    removeRelatedVoice: function (req, res, next) {
      /* DELETE
       * req.body = {
       *   relatedVoiceId: Hashids.encode
       * }
       */

      ACL.isAllowed('manageRelatedVoices', 'voices', req.role, {
        currentPerson: req.currentPerson,
        voiceId: req.activeVoice.id
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError('Unauthorized.'));
        }

        RelatedVoice.find({
          voice_id: req.activeVoice.id,
          related_id: hashids.decode(req.body.relatedVoiceId)[0]
        }, function (err, relatedVoice) {
          if (err) { return next(err); }

          if (relatedVoice.length < 1) {
            return res.json({ status: 'not a related voice' });
          } else {
            var relatedVoiceToDestroy = new RelatedVoice(relatedVoice[0]);

            relatedVoiceToDestroy.destroy(function (err) {
              if (err) { return next(err); }

              return res.json({ status: 'removed related voice' });
            });
          }
        });
      });
    }

  }
});

module.exports = new VoicesController();
