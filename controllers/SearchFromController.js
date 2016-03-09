var parser = require('parse-rss');
var OAuth = require('oauth').OAuth;
var Twitter = require('twitter');
var YouTube = require('youtube-node');

var youtube = new YouTube();
youtube.setKey(CONFIG.youtube.key);
youtube.addParam('order', 'date');

var oauthOptions = {
  key : CONFIG.twitter.consumer_key,
  secret : CONFIG.twitter.consumer_secret,
  requestTokenURL : 'https://twitter.com/oauth/request_token',
  requestAccessURL : 'https://twitter.com/oauth/access_token',
  version : '1.0A',
  method : 'HMAC-SHA1',
  callback : CONFIG.siteUrl[CONFIG.environment] + '/twitter/callback'
};

var consumer = new OAuth(oauthOptions.requestTokenURL, oauthOptions.requestAccessURL,
  oauthOptions.key, oauthOptions.secret, oauthOptions.version, oauthOptions.callback, oauthOptions.method);

var SearchFrom = Class('SearchFrom')({
  prototype : {

    google : function(req, res, next) {
      /**
       * req.body = {
       *   query: <String>,
       * }
       */

      parser('https://news.google.com/news?q=' + encodeURIComponent(req.body.query) + '&output=rss', function(err, response) {
        if (err) {
          return next(err);
        }

        var result = [];

        response.forEach(function(item) {
          var obj = {
            title : item.title,
            description : item.description,
            date : item.date,
            sourceUrl : item.link
          }

          result.push(obj);
        });

        res.format({
          json : function() {
            res.json(result);
          }
        });
      });
    },

    youtube : function(req, res, next) {
      /**
       * req.body = {
       *   query: <String>,
       *   nextPageToken: null | <String>,
       * }
       */

      if (req.body.nextPageToken) {
        youtube.addParam('pageToken', req.body.nextPageToken)
      }

      youtube.search(req.body.query, 50, function(err, response) {
        if (err) { return next(err); }

        var result = {
          nextPageToken: response.nextPageToken || null,
          pageInfo: response.pageInfo,
          videos: []
        };

        response.items.forEach(function(item) {
          if (item.id.kind === 'youtube#video') {
            var obj = {
              title : item.snippet.title,
              description : item.snippet.description,
              thumb : item.snippet.thumbnails.medium,
              date : item.snippet.publishedAt,
              sourceUrl : 'http://youtube.com/watch?v=' + item.id.videoId
            }

            result.videos.push(obj);
          }
        });

        res.json(result);
      });
    },

    twitterOpen : function(req, res, next) {
      res.render('twitter/open');
    },

    authorizeTwitter : function authorizeTwitter(req, res, next) {
      consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
        if (error) {
          return next(new Error('Error getting Twitter OAuth request token'));
        } else {
          req.session.twitterRequestToken = oauthToken;
          req.session.twitterRequestTokenSecret = oauthTokenSecret;

          return res.redirect("https://twitter.com/oauth/authorize?oauth_token=" + req.session.twitterRequestToken);
        }
      });
    },

    twitterCallback : function twitterCallback(req, res, next) {
      if (req.query.denied) {
        return res.render('twitter/callback', {authorized : false});
      }

        consumer.getOAuthAccessToken(req.session.twitterRequestToken, req.session.twitterRequestTokenSecret, req.query.oauth_verifier, function(error, twitterAccessToken, twitterAccessTokenSecret, results) {
          if (error) {
            logger.error(error);

            return next(new Error(error));
          } else {
            req.session.twitterAccessToken = twitterAccessToken;
            req.session.twitterAccessTokenSecret = twitterAccessTokenSecret;

            async.series([function(done) {
              if (!req.user) {
                return done();
              }

              var user = new User(req.user);

              user.twitterCredentials = {
                accessToken : twitterAccessToken,
                accessTokenSecret : twitterAccessTokenSecret
              };

              user.save(function(err, result) {
                if (err) {
                  return done(err);
                }

                done();
              });
            }], function(err) {
              if (err) {
                return next(err);
              }

              return res.render('twitter/callback.html', {authorized : true});
            });
          }
        });
    },

    hasTwitterCredentials : function hasTwitterCredentials(req, res, next) {
      var response = {
        hasTwitterCredentials : false
      };

      if (req.session.twitterAccessToken && req.session.twitterAccessTokenSecret) {
        response.hasTwitterCredentials = true;
      } else {
        return res.json(response);
      }

      var TwitterClient = new Twitter({
        'consumer_key' : CONFIG.twitter['consumer_key'],
        'consumer_secret' : CONFIG.twitter['consumer_secret'],
        'access_token_key' : req.session.twitterAccessToken,
        'access_token_secret' : req.session.twitterAccessTokenSecret
      });

      TwitterClient.get('/account/verify_credentials', false, function(err, data) {
        if (err) {
          var errors = ['Unknown Error'];

          if (err.length > 0) {
            errors = err.map(function(item) {
              return item.message;
            });
          }

          return res.json({errors : errors});
        }

        if (data) {
          return res.json(response);
        }
      });
    },

    twitterSearch : function twitterSearch(req, res, next) {
      var TwitterClient = new Twitter({
        'consumer_key' : CONFIG.twitter['consumer_key'],
        'consumer_secret' : CONFIG.twitter['consumer_secret'],
        'access_token_key' : req.session.twitterAccessToken,
        'access_token_secret' : req.session.twitterAccessTokenSecret
      });

      TwitterClient.get(
        'search/tweets',
        {
          q : req.body.query + ' exclude:retweets',
          'result_type' : 'mixed',
          'max_id' : req.body.maxId || null,
          count : 50
        },
        function(err, tweets, response) {
          if (err) {
            return next(new Error(err));
          }

          logger.info('Got ' +  tweets.statuses.length + ' tweets...');

          res.json(tweets.statuses);
        }
      );
    }

  }
});

module.exports = new SearchFrom();
