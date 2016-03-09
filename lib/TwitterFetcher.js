var Twitter = require('twitter');
var Scrapper = require(process.cwd() + '/lib/cvscrapper');

var TwitterClient = new Twitter({
  'consumer_key' : CONFIG.twitter['consumer_key'],
  'consumer_secret' : CONFIG.twitter['consumer_secret'],
  'access_token_key' : CONFIG.twitter['access_token'],
  'access_token_secret' : CONFIG.twitter['access_token_secret']
});

var TwitterFetcher = Class('TwitterFetcher')({
  prototype : {
    voice : null,
    count : 0,
    lastIdStr : null,
    tweets : [],

    init : function(config) {
      Object.keys(config || {}).forEach(function(propertyName) {
          this[propertyName] = config[propertyName];
      }, this);

      return this;
    },

    fetchTweets : function(callback) {
      var fetcher = this;

      async.series([function(next) {
        db('Tweets').where({
          'voice_id' : fetcher.voice.id
        }).orderBy('created_at', 'DESC').first('id_str').asCallback(function(err, result) {
          if (err) {
            return next(err);
          }

          fetcher.lastIdStr = result || '0';

          next();
        });
      }, function(next) {
        logger.info('Fetching ' + fetcher.count + ' tweets');

        TwitterClient.get(
          'search/tweets',
          {
            q : fetcher.voice.twitterSearch + ' exclude:retweets exclude:replies',
            'result_type' : 'recent',
            'since_id' : fetcher.lastIdStr,
            count : fetcher.count
          },
          function(err, tweets, response) {
            if (err) {
              return next(err);
            }

            logger.info('Fetched ' +  tweets.statuses.length + ' tweets...');
            fetcher.tweets = tweets.statuses || [];

            next();
          }
        );
      }, function(next) {

        async.eachLimit(fetcher.tweets, 1, function(t, nextTweet) {
          var tweet = new Tweet({
            voiceId : fetcher.voice.id,
            idStr : t.id_str,
            text : t.text
          });

          tweet.save(function(err, result) {
            nextTweet(err);
          });
        }, next);


      }], callback);

      return this;
    },

    createPosts : function(callback) {
      var fetcher = this;

      async.eachLimit(fetcher.tweets, 1, function(tweet, nextTweet) {
        logger.info('Processing tweet ' + tweet.id_str);
        if (tweet.entities.urls.length === 0) {
          logger.info('Tweet has no url, trying next Tweet...');
          return nextTweet();
        }

        async.eachLimit(tweet.entities.urls, 1, function(url, nextURL) {
          request(url , function(err, res, body) {
            if (err) {
              logger.info('Could not get ' + url);
              logger.error(err);
              logger.error(err.stack);
              logger.info('Trying next URL');

              return nextURL();
            }

            var longURL = res.request.uri.href;

            logger.info('Will process ' + longURL);

            Post.find(['source_url = ?', [longURL]], function(err, posts) {
              if (err) {
                logger.error(err);
                logger.info('Trying next URL...');

                return nextURL();
              }

              if (posts.length > 0) {
                logger.info('URL exists... trying next URL');
                return nextURL();
              }

              Scrapper.processUrl(longURL, res, function(err, result) {
                if (err) {
                  logger.info('Scrapper Error');
                  logger.error(err.stack);
                  logger.info('Trying next URL');

                  return nextURL();
                }

                logger.info('Creating new Post with data:');

                var data = {
                  sourceUrl : result.sourceUrl,
                  sourceType : result.sourceType,
                  sourceService : result.sourceService,
                  title : result.title.substr(0, 64),
                  description : result.description.substr(0, 179),
                  voiceId : fetcher.voice.id,
                  ownerId : fetcher.voice.ownerId,
                  approved : false
                }

                logger.info(data);

                var post = new Post(data);

                post.save(function(err, postResult) {
                  if (err) {
                    logger.error('Could not save post');
                    logger.error(err);
                    logger.error(err.stack);
                    logger.info('Trying next URL');

                    return nextURL();
                  }

                  if (result.images.length > 0) {

                    logger.info('Post has an image');
                    logger.info(result.images[0].path);

                    var imagePath = process.cwd() + '/public' + result.images[0].path;

                    post.uploadImage('image', imagePath, function(err) {
                      if (err) {
                        logger.error(err);
                        logger.error(err.stack);
                      }

                      post.save(function(err, result) {
                        return nextURL();
                      });
                    });
                  } else {
                    logger.info('Post saved without an image');
                    return nextURL();
                  };
                });
              });
            });
          });
        }, nextTweet);
      }, callback);

      return this;
    }
  }
});
