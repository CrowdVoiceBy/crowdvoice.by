#!/usr/bin/env node

var domain = require('domain');

var d = domain.create();

var path = require('path');

var application = require(path.join(process.cwd(), 'lib', 'neonode-core'));
require('./../lib/TwitterFetcher');

CONFIG.database.logQueries = false;

var moment = require('moment');

var Scrapper = require(process.cwd() + '/lib/cvscrapper');

var LOCK_FILE = '/tmp/fetching_tweets';

process.on('SIGTERM', function() {
  logger.info('Twitter Fetcher Terminated');
  logger.info('Cleaning...');
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
  }

  process.exit();
});

process.on('SIGINT', function() {
  logger.info('Twitter Fetcher Terminated');
  logger.info('Cleaning...');
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
  }

  process.exit();
});

d.on('error', function(err) {
  logger.error('Twitter Fetcher Error');
  logger.error(err);
  logger.error(err.stack);
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
  }
});

var cronExpression = '00 00 * * * *';

if (CONFIG.environment === 'development') {
  cronExpression = '* * * * * *';
}

d.run(function() {

  var CronJob = require('cron').CronJob;
  var job = new CronJob({
    cronTime: cronExpression,
    onTick: function() {
      console.log('fetch...')
      var fetching = false;

      if (fs.existsSync(LOCK_FILE)) {
        fetching = true;
      }

      if (fetching) {
        logger.info('Fetcher is already running');
        return false;
      }

      fs.closeSync(fs.openSync(LOCK_FILE, 'w'));

      CONFIG.database.logQueries = true;
      db('Voices')
        .where('status', '!=', 'STATUS_ARCHIVED')
        .andWhere('status', '!=', 'STATUS_UNLISTED')
        .andWhere('twitter_search', 'IS NOT', null)
        .andWhere('tweet_last_fetch_at', 'IS', null)
        .orWhere('tweet_last_fetch_at', '<', moment().subtract(1, 'hour').format())
        .asCallback(function(err, voices) {
          voices = Argon.Storage.Knex.processors[0](voices);

          async.eachLimit(voices, 1, function(voice, next) {

            var twitterFetcher = new TwitterFetcher({
              voice : voice,
              count : 100
            });

            async.series([function(done) {
              twitterFetcher.fetchTweets(done);
            }, function(done) {
              twitterFetcher.createPosts(done);
            }, function(done) {
              var voiceInstance = new Voice(voice);
              voiceInstance.tweetLastFetchAt = new Date(Date.now());

              voiceInstance.save(function(err, result) {
                logger.info('Updated Voice.tweetLastFetchAt');
                done();
              });
            }], function(err) {
              next(err);
            });
          }, function(err) {
            if (err) {
              logger.error(err);
              console.log(err.stack);
            }

            fs.unlinkSync(LOCK_FILE);
          });
        });
    },
    start: true,
    timeZone: 'UTC'
  });

  job.start();
});
