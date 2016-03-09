'use strict'
var sanitize = require("sanitize-html");

var PostsPresenter = Module('PostsPresenter')({
  build : function build(posts, currentPerson, callback) {
    var response = [];

    async.eachLimit(posts, 1, function(post, next) {

      var postInstance = new Post(post);

      post.id = hashids.encode(post.id);
      post.voiceId = hashids.encode(post.voiceId);
      post.ownerId = hashids.encode(post.ownerId);
      post.title = sanitize(post.title) || "No title";
      post.description = sanitize(post.description) || "No description";

      var images = {};

      for (var version in postInstance.imageMeta) {
        images[version] = {
          url : postInstance.image.url(version),
          meta : postInstance.image.meta(version)
        };
      }

      post.postImages = images;

      var faviconPath;

      if (post.faviconPath) {
        if (CONFIG.environment === 'development') {
          faviconPath = '/uploads/favicons/' + post.faviconPath;
        } else {
          faviconPath = '//s3.amazonaws.com/crowdvoice.by/' + CONFIG.environment + '/favicons/' + post.faviconPath;
        }

        post.faviconPath = faviconPath
      }

      async.series([

        // .voted, whether you've voted on this post
        function(done) {
          if (currentPerson) {
            Vote.find({
              'entity_id' : hashids.decode(currentPerson.id)[0],
              'post_id' : postInstance.id
            }, function(err, result) {
              if (err) { return done(err); }

              post.voted = true;

              if (result.length === 0) {
                post.voted = false;
              }

              return done();
            });
          } else {
            post.voted = false;
            return done();
          }
        },

        // .saved, whether you've saved this post
        function(done) {
          if (currentPerson) {
            SavedPost.find({
              entity_id: hashids.decode(currentPerson.id)[0],
              post_id: postInstance.id
            }, function (err, result) {
              if (err) { return done(err); }

              if (result.length > 0) {
                post.saved = true;
              } else {
                post.saved = false;
              }

              post.currentPerson = currentPerson;

              return done();
            });
          } else {
            post.saved = false;
            return done();
          }
        },

        // .totalSaves, total amount of this the post has been saved
        function(done) {
          SavedPost.find({
            post_id: postInstance.id
          }, function (err, result) {
            if (err) { return done(err); }

            post.totalSaves = result.length

            return done();
          });
        },

        function(done) {

          // voice
          Voice.find({ id : postInstance.voiceId }, function(err, result) {
            if (err) {
              return done(err);
            }

            VoicesPresenter.build(result, currentPerson, function(err, voices) {
              if (err) {
                return done(err);
              }

              post.voice = voices[0];

              done();
            });
          });
        }], function(err) {
        if (err) { return next(err); }

        response.push(post);
        return next();
      });
    }, function(err) {
      callback(err, response);
    });
  }
});

module.exports = PostsPresenter;
