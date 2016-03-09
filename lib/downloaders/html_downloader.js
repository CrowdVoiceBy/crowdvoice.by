'use strict';

var downloader = require(__dirname + '/downloader.js');
var sa = require('superagent');

var HtmlDownloader = Module('HtmlDownloader').includes(Downloader)({
  allowedUrls : [
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/
  ],

  retrieveData : function (url, res, done) {
    return done(null, {
      contentType: res.headers['content-type'],
      text: res.body
    });
  }
});

module.exports = HtmlDownloader;
