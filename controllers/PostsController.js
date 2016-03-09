var Scrapper = require(process.cwd() + '/lib/cvscrapper');
var sanitizer = require('sanitize-html');
var ReadabilityParser = require(path.join(__dirname, '../lib/ReadabilityParser.js'));

require(path.join(process.cwd(), 'lib', 'krypton', 'presenters', 'PostsPresenter.js'))

var downsize = require('downsize');

var Twitter = require('twitter');

var PostsController = Class('PostsController').includes(BlackListFilter)({
  prototype : {
    init : function (config){
      this.name = this.constructor.className.replace('Controller', '')

      return this;
    },

    index : function index (req, res, next) {
      return next(new NotFoundError('Not Implemented'));
    },

    show : function show(req, res, next) {
      var post,
        readablePost,
        already = false;

      async.series([function(done) {
        K.Post.query()
          .where({id : hashids.decode(req.params.postId)[0]})
          .then(function(result) {
            if (result.length === 0) {
              return done(new NotFoundError('Post Not Found'));
            }

            K.PostsPresenter.build(result, req.currentPerson)
              .then(function(posts) {
                post = posts[0];

                return done();
              }).catch(done);
          }).catch(done);
      }, function(done) {
        if (post.sourceType !== Post.SOURCE_TYPE_LINK && post.sourceService !== Post.SOURCE_SERVICE_LINK) {
          return done();
        }

        ReadablePost.find({
          post_id: hashids.decode(post.id)[0]
        }, function (err, readablePosts) {
          if (err) { return done(err); }

          if (readablePosts[0]) {
            already = true;
            readablePost = new ReadablePost(readablePosts[0]);
          }

          return done();
        });
      }, function(done) {
        if (post.sourceType !== Post.SOURCE_TYPE_LINK && post.sourceService !== Post.SOURCE_SERVICE_LINK) {
          return done();
        }

        // we already found something
        if (already) {
          return done();
        }

        var parser = new ReadabilityParser(post.sourceUrl);

        parser.fetch(function(err, readability) {
          if (err) { return done(err); }

          readablePost = new ReadablePost({
            post_id: hashids.decode(post.id)[0],
            data: readability.parse(),
            readerable: readability.isProbablyReaderable(),
          });

          if (!readablePost.data) {
            return readablePost.save(done);
          }

          var defaults = _.clone(sanitizer.defaults.allowedTags);
          defaults.splice(sanitizer.defaults.allowedTags.indexOf('a'), 1);

          readablePost.data.content = sanitizer(readablePost.data.content, {
            allowedTags: defaults.concat(['img'])
          });

          readablePost.data.content = downsize(readablePost.data.content, {
            words : 199,
            append : "...",
            round : false
          });

          readablePost.save(done)
        });
      }], function(err) {
        if (err) { return next(err); }

        res.locals.post = post;
        res.locals.readablePost = readablePost;

        res.format({
          json : function() {
            res.json(post);
          },
          html : function() {
            res.render('posts/show', { layout : 'postShow' });
          }
        });
      });
    },

    create : function create(req, res, next) {
      ACL.isAllowed('create', 'posts', req.role, {
        currentPerson: req.currentPerson,
        activeVoice: req.activeVoice,
        voiceOwnerProfile: req.params.profileName
      }, function(err, response) {
        if (err) {return next(err)}

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        var approved = false;

        if (req.role === 'Admin'
          || response.isVoiceDirectOwner
          || response.isVoiceIndirectOwner
          || response.isVoiceCollaborator
          || response.isOrganizationMember
          || response.isOrganizationOwner) {

          approved = true;
        }

        var posts = req.body.posts;

        if (posts.constructor === Object) {
          posts = [posts];
        }

        var results = [];

        async.each(posts, function(item, nextPost) {
          var postData = {};

          postData.title = item.title;
          postData.description = item.description;
          postData.sourceUrl = item.sourceUrl;
          postData.sourceService = item.sourceService;
          postData.sourceType = item.sourceType;
          postData.approved = approved;
          postData.ownerId = response.postOwner.id;
          postData.voiceId = req.activeVoice.id;
          postData.publishedAt = new Date(item.publishedAt);
          postData.extras = item.extras;

          if (postData.sourceUrl === 'local_image') {
            var hrtime = process.hrtime();
            postData.sourceUrl = 'local_image_' + hashids.encode(parseInt(hrtime[0] + '' + hrtime[1], 10));
          }

          var post = new K.Post(postData);

          post.save().then(function() {
            var imagePath = '';
            if (item.imagePath && item.imagePath.length > 0) {
              imagePath = path.join(process.cwd(), 'public', item.imagePath.replace(/preview_/, ''));
            }

            post.uploadImage('image', imagePath, function() {
              post.save().then(function() {
                K.Voice.query()
                  .where({id : post.voiceId})
                  .then(function(voice) {
                    voice = voice[0];

                    if (item.images) {
                      item.images.forEach(function(image) {
                        if (fs.existsSync(process.cwd() + '/public' + image)) {
                          fs.unlinkSync(process.cwd() + '/public' + image);
                          logger.info('Deleted tmp image: ' + process.cwd() + '/public' + image);
                        }

                        if (fs.existsSync(process.cwd() + '/public' + image.replace(/preview_/, ''))) {
                          fs.unlinkSync(process.cwd() + '/public' + image.replace(/preview_/, ''));
                          logger.info('Deleted tmp image: ' + process.cwd() + '/public' + image.replace(/preview_/, ''));
                        }
                      });
                    }

                    FeedInjector().inject(voice.ownerId, 'item voiceNewPosts', voice, function (err) {
                      if (err) { return nextPost(err); }

                      results.push(post);

                      return nextPost();
                    });
                  }).catch(nextPost);
              }).catch(nextPost);

            });
          }).catch(nextPost);

        }, function(err) {
          if (err) { return next(err); }

          K.PostsPresenter.build(results, req.currentPerson).then(function(result) {
            return res.json(result);
          }).catch(next);
        });
      });
    },

    edit : function edit(req, res) {
      res.render('posts/edit.html', {layout : false});
    },

    update : function update(req, res, next) {
      ACL.isAllowed('update', 'posts', req.role, {
        currentPerson : req.currentPerson,
        voiceSlug : req.params.voiceSlug,
        profileName : req.params.profileName
      }, function(err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) { return next(new ForbiddenError()); }

        var body = req.body;

        K.Post.query()
          .where({ id : hashids.decode(req.params.postId)[0] })
          .then(function(result) {
            if (result.length === 0) {
              return next(new NotFoundError('Post Not Found'));
            }

            var post = result[0];

            post.title = body.title || post.title;
            post.description = body.description || post.description;
            post.sourceUrl = body.sourceUrl || post.sourceUrl;
            post.approved = body.approved || post.approved;
            post.publishedAt = (body.publishedAt ? new Date(new Date(body.publishedAt).toUTCString()) : new Date(post.publishedAt));

            post.save().then(function() {
              var imagePath = body.imagePath.trim();

              if (body.imagePath && body.imagePath.length > 0) {
                if (/^https?/.test(body.imagePath.trim()) === false) {
                  imagePath = path.join(process.cwd(), 'public', body.imagePath.replace(/preview_/, ''));
                }
              }

              async.series([function(done) {
                if (imagePath === '') {
                  return done();
                }

                // NOTE: .uploadImage does not return err, thus if you just pass done
                //       to it directly it'll always return error
                post.uploadImage('image', imagePath, function () {
                  done();
                });
              }, function(done) {
                if (imagePath === '') {
                  post.imageBaseUrl = '';
                  post.imageMeta = {};
                }
                done();
              }, function(done) {
                post.save().then(function() {
                  done();
                }).catch(function(err) {
                  logger.error(err);
                  done(err);
                });
              }], function(err) {
                if (err) { return next(err); }

                K.PostsPresenter.build([post], req.currentPerson).then(function(posts) {
                  if (body.images) {
                    body.images.forEach(function(image) {
                      if (fs.existsSync(process.cwd() + '/public' + image)) {
                        fs.unlinkSync(process.cwd() + '/public' + image);
                        logger.info('Deleted tmp image: ' + process.cwd() + '/public' + image);
                      }

                      if (fs.existsSync(process.cwd() + '/public' + image.replace(/preview_/, ''))) {
                        fs.unlinkSync(process.cwd() + '/public' + image.replace(/preview_/, ''));
                        logger.info('Deleted tmp image: ' + process.cwd() + '/public' + image.replace(/preview_/, ''));
                      }
                    });
                  }

                  res.json(posts[0]);
                }).catch(next);
              });
            });
          }).catch(next);
      });
    },

    destroy : function destroy(req, res, next) {
      ACL.isAllowed('destroy', 'posts', req.role, {
        currentPerson : req.currentPerson,
        voiceSlug : req.params.voiceSlug,
        profileName : req.params.profileName
      }, function(err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) { return next(new ForbiddenError()); }

        K.Post.query()
          .where({ id : hashids.decode(req.params.postId)[0] })
          .then(function(result) {
            if (result.length === 0) {
              return next(new NotFoundError('Post not found'));
            }

            var post = result[0];

            post.destroy().then(function() {
              res.json({ status : 'deleted' });
            });
          }).catch(next);
      });
    },

    upload : function upload(req, res, next) {
      ACL.isAllowed('upload', 'posts', req.role, {
        currentPerson: req.currentPerson,
        activeVoice: req.activeVoice,
        voiceOwnerProfile: req.params.profileName
      }, function(err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) { return next(new ForbiddenError()); }

        if (!req.files.image) {
          return res.status(400).json({ status : 'Missing Image' });
        }

        if (/.*\.(jpe?g|png|gif|tiff)[^\.]*$/i.test(req.files.image.path) === false) {
          return res.status(400).json({ status : 'Invalid Image Format' });
        }

        var transform = sharp(req.files.image.path)
          .resize(340)
          .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
          .embed()
          .progressive()
          .flatten()
          .background('#FFFFFF')
          .quality(100);

        var savePath = path.join(process.cwd(),  '/public/posts_images/'),
          hrtime = process.hrtime(),
          filename = 'upload_' + (hrtime[0] + hrtime[1] / 1000000) + '.jpg';

        var post = {
          sourceUrl : 'local_image',
          sourceType : 'image',
          sourceService : 'raw',
          title : 'No Title',
          description : 'No Description',
          images : null
        };

        async.series([
          // save original
          function (nextSeries) {
            var rs = fs.createReadStream(req.files.image.path),
              ws = fs.createWriteStream(path.join(savePath, filename));

            rs.pipe(ws);

            rs.on('end', function () {
              ws.end();
              return nextSeries();
            });

            rs.on('error', function (err) {
              return nextSeries(err);
            });
            ws.on('error', function (err) {
              return nextSeries(err);
            });
          },

          // make preview from original
          function (nextSeries) {
            transform.pipe(sharp().toFile(savePath + 'preview_' + filename, function(err, info) {
              if (err) { return nextSeries(err); }

              info.path = '/posts_images/preview_' + filename;

              post.images = [info];

              return nextSeries();
            }));
          }
        ], function (err) {
          if (err) { return next(err); }

          res.json(post);
        });
      });
    },

    preview : function preview(req, res, next) {
      var controller = this;

      ACL.isAllowed('preview', 'posts', req.role, {
        currentPerson: req.currentPerson,
        activeVoice: req.activeVoice,
        voiceOwnerProfile: req.params.profileName
      }, function (err, response) {
        if (err) { return next(err) }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        if (req.body.url) {
          return controller._previewURL(req, res);
        }

        if (req.body.id_str) {
          return controller._previewTweet(req, res);
        }

        return next(new Error('Invalid Parameters'));
      });
    },

    _previewTweet : function _previewTweet(req, res) {
      var controller = this;

      var TwitterClient = new Twitter({
        'consumer_key' : CONFIG.twitter['consumer_key'],
        'consumer_secret' : CONFIG.twitter['consumer_secret'],
        'access_token_key' : req.session.twitterAccessToken,
        'access_token_secret' : req.session.twitterAccessTokenSecret
      });

      TwitterClient.get('/statuses/show/' + req.body.id_str + '.json', {include_entities:true}, function(err, tweet) {
        if (err) {
          return res.status(500).json(err);
        }

        var posts = [];

        var tweetPost = K.Post.buildFromTweet(tweet);
        tweetPost.images = [];

        posts.push(tweetPost);

        // Extract URLs from tweet;
        var hasUrls = false;

        if (tweet.entities && tweet.entities.urls && tweet.entities.urls.length > 0) {
          hasUrls = true;
        }

        var hasMedia = false;

        if (tweet.entities && tweet.entities.media && tweet.entities.media.length > 0) {
          hasMedia = true;
        }

        async.series([function(done) {
          if (!hasUrls) {
            return done();
          }

          async.each(tweet.entities.urls, function(entity, doneEach) {
            controller._processURL(entity.url, function(err, result) {
              if (result.status === 200) {
                posts.push(result.result);
              }

              return doneEach();
            });
          }, done);
        }, function(done) {
          if (!hasMedia) {
            return done();
          }

          async.each(tweet.entities.media, function(entity, doneEach) {
            controller._processURL(entity.media_url, function(err, result) {
              if (result.status === 200) {
                posts.push(result.result);
              }

              return doneEach();
            });
          }, done);
        }], function(err) {
          if (err) {
            return res.status(500).json(err);
          }

          return res.json(posts);
        });
      });
    },

    _processURL : function _processURL(originalURL, callback) {
      var logScrapperError = function (url, error, callback) {
        var errorLog = new ScrapperError({
          url: url,
          error: error,
          errorStack: error.stack
        });

        logger.error(error);
        logger.error(error.stack);

        errorLog.save(callback);
      };

      request.get(originalURL, function (err, response) {
        if (err) {
          return logScrapperError(originalURL, err, function (err) {
            if (err) { return callback(err);; }

            return callback(err, {
              status : 400,
              message : 'Bad URL',
              error : 'Bad URL'
            });
          });
        }

        Scrapper.processUrl(response.request.uri.href, response, function (err, result) {
          if (err) {
            return logScrapperError(response.request.uri.href, err, function (err) {
              if (err) { return callback(err); }

              return callback(err, {
                status : 400,
                message: 'There was an error in the request',
                error: err
              });
            });
          }

          return callback(err, {
            status : 200,
            result : result
          });
        });
      });
    },

    _previewURL : function _previewURL(req, res) {

      this._processURL(req.body.url, function(err, result) {
        if (err) {
          return res.status(500).json(err);
        }

        if (result.status !== 200) {
          return res.status(result.status).json(result.message);
        }

        res.status(result.status).json(result.result);
      });

    },

    // Create reference for SavedPosts
    // NOTE: This creates a SavedPost record, as opposed to creating a post
    savePost : function savePost(req, res, next) {
      ACL.isAllowed('savePost', 'posts', req.role, {
        currentPerson : req.currentPerson
      }, function(err, response) {
        if (err) { return next(err) }

        if (!response.isAllowed) { return next(new ForbiddenError('Unauthorized.')); }

        var sp = new K.SavedPost({
          entityId: response.person.id,
          postId: hashids.decode(req.params.postId)[0]
        });

        sp.save().then(function() {
          res.format({
            json : function() {
              res.json({ status : 'saved' });
            }
          });
        }).catch(next);
      });
    },

    unsavePost : function unsavePost(req, res, next) {
      ACL.isAllowed('unsavePost', 'posts', req.role,  {
        currentPerson : req.currentPerson
      }, function(err, response) {
        if (err) {
          return next(err)
        }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        var person = req.currentPerson;

        K.SavedPost.query()
          .where({
            'entity_id' : response.person.id,
            'post_id' : hashids.decode(req.params.postId)[0]
          }).then(function(result) {
            if (result.length === 0) { next(new Error('Saved Post Not found')); }

            result[0].destroy().then(function() {
              res.format({
                json: function() {
                  res.json({ status : 'removed' });
                }
              });
            });
          }).catch(next);
      });
    },

    saveArticle: function (req, res, next) {
      /*
       * req.body = {
       *   title: String,
       *   content: String
       * }
       */

      ACL.isAllowed('create', 'posts', req.role, {
        currentPerson : req.currentPerson,
        activeVoice : req.activeVoice,
        voiceOwnerProfile : req.params.profileName
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        var approved = false;

        if (req.role === 'Admin'
          || response.isVoiceDirectOwner
          || response.isVoiceIndirectOwner
          || response.isVoiceCollaborator
          || response.isOrganizationMember
          || response.isOrganizationOwner) {

          approved = true;
        }

        var post = new K.Post({
          title: req.body.title,
          description: sanitizer(req.body.content),
          ownerId: response.postOwner.id,
          voiceId: req.activeVoice.id,
          publishedAt : new Date(req.body.publishedAt),
          approved: approved,
          sourceType: Post.SOURCE_TYPE_TEXT,
          sourceUrl: null, // required if sourceType !== Post.SOURCE_TYPE_TEXT
          sourceService: Post.SOURCE_SERVICE_LOCAL
        });

        post.save().then(function() {
          var imagePath = req.body.imagePath.trim();

          if (req.body.imagePath && req.body.imagePath.length > 0) {
            if (/^https?/.test(req.body.imagePath.trim()) === false) {
              imagePath = path.join(process.cwd(), 'public', req.body.imagePath.replace(/preview_/, ''));
            }
          }

          post.uploadImage('image', imagePath, function() {
            post.save().then(function() {
              FeedInjector().inject(req.activeVoice.ownerId, 'item voiceNewPosts', req.activeVoice, function (err) {
                if (err) { return next(err); }

                K.PostsPresenter.build([post], req.currentPerson).then(function(posts) {
                  if (req.body.imagePath) {
                    fs.unlinkSync(process.cwd() + '/public' + req.body.imagePath);
                    logger.info('Deleted tmp image: ' + process.cwd() + '/public' + req.body.imagePath);
                  }

                  return res.json(posts[0]);
                }).catch(next);
              });
            }).catch(next);
          });
        }).catch(next);
      });
    },

    deleteOlderThan: function (req, res, next) {
      /*
       * req.body = {
       *   olderThanDate: <Date string>
       * }
       */

      ACL.isAllowed('deleteOlderThan', 'posts', req.role, {
        currentPerson: req.currentPerson,
        voiceSlug: req.params.voiceSlug,
        profileName: req.params.profileName
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError('Unauthorized'));
        }

        K.Post.query()
          .where('voice_id', req.activeVoice.id)
          .andWhere('approved', false)
          .andWhereRaw("created_at < '" + moment(req.body.olderThanDate).format() + "'")
          .del()
          .then(function(affectedRows) {
            res.json({
              status: 'ok',
              deletedPostsCount: affectedRows
            });
          }).catch(next);
      });
    },

    deleteAllUnmoderated: function (req, res, next) {
      ACL.isAllowed('deleteAllUnmoderated', 'posts', req.role, {
        currentPerson: req.currentPerson,
        voiceSlug: req.params.voiceSlug,
        profileName: req.params.profileName
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError('Unauthorized.'));
        }

        K.Post.query()
          .where({
            voice_id: req.activeVoice.id,
            approved: false
          })
          .del()
          .then(function(affectedRows) {
            res.json({
              status: 'ok',
              deletedPostsCount: affectedRows
            });
          }).catch(next);
      });
    },

    uploadPostImage: function (req, res, next) {
      ACL.isAllowed('uploadPostImage', 'posts', req.role, {
        currentPerson: req.currentPerson,
        voiceSlug: req.params.voiceSlug,
        profileName: req.params.profileName
      }, function (err, response) {
        if (err) { return next(err); }

        if (!response.isAllowed) {
          return next(new ForbiddenError());
        }

        if (!req.files.image) {
          return res.status(400).json({ status : 'Missing Image' });
        }

        if (/.*\.(jpe?g|png|gif|tiff)[^\.]*$/i.test(req.files.image.path) === false) {
          return res.status(400).json({ status : 'Invalid Image Format' });
        }

        var transform = sharp(req.files.image.path)
          .resize(340)
          .interpolateWith(sharp.interpolator.locallyBoundedBicubic)
          .embed()
          .progressive()
          .flatten()
          .background('#FFFFFF')
          .quality(100);

        var savePath = path.join(process.cwd(), '/public/posts_images/'),
          hrtime = process.hrtime(),
          filename = 'upload_' + (hrtime[0] + hrtime[1] / 1000000) + '.jpg',
          imageInfo;

        async.series([
          // save original
          function (nextSeries) {
            var rs = fs.createReadStream(req.files.image.path),
              ws = fs.createWriteStream(path.join(savePath, filename));

            rs.pipe(ws);

            rs.on('end', function () {
              ws.end();
              return nextSeries();
            });

            rs.on('error', function (err) {
              return nextSeries(err);
            });
            ws.on('error', function (err) {
              return nextSeries(err);
            });
          },

          // make preview from original
          function (nextSeries) {
            transform.pipe(sharp().toFile(savePath + 'preview_' + filename, function(err, info) {
              if (err) { return nextSeries(err); }

              info.path = '/posts_images/preview_' + filename;

              imageInfo = info;

              return nextSeries();
            }));
          }
        ], function (err) {
          if (err) { return next(err); }

          res.json(imageInfo);
        });
      });
    },

  }
});

module.exports = new PostsController();
