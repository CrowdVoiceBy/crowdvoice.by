'use strict';

var downloader = require(__dirname + '/downloader.js');
var sa = require('superagent');

var YouTubeDownloader = Module('YouTubeDownloader').includes(Downloader)({
  allowedUrls : [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?.*v=[^&]/i
  ],

  retrieveData : function (url, response, done) {
    if (!url.match(/v=([^&]*)/)) {
      return done(new Error('Cannot process this youtube url'));
    }

    var videoId = url.match(/v=([^&]*)/)[1];

    sa.get('https://www.googleapis.com/youtube/v3/videos?id=' + videoId + '&part=snippet&key=' +  CONFIG.youtube.key)
      .accept('json')
      .end(function (err, res) {
        done(err, res.body);
      });
  }
});

module.exports = YouTubeDownloader;
