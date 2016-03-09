'use strict';

var downloader = require(__dirname + '/downloader.js');
var sa = require('superagent');

var VimeoDownloader = Module('VimeoDownloader').includes(Downloader)({
  allowedUrls : [
    /^https?:\/\/(?:www\.)?vimeo\.com\/(?:.*\/)?(\d+)/i
  ],

  retrieveData : function (url, response, done) {
    if (!url.match(/(?:.*#)?(\d+)/)) {
      return done(new Error('Cannot process this vimeo url'));
    }

    var videoId = url.match(/(?:.*#)?(\d+)/)[0];

    sa.get('http://vimeo.com/api/v2/video/' + videoId + '.json')
      .accept('json')
      .end(function (err, res) {
        done(err, res.body);
      });
  }
});

module.exports = VimeoDownloader;
