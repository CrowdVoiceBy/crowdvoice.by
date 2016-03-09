'use strict';

var Scrapper = Module('Scrapper')({
  allowedUrls : [],
  deniedUrls : [],

  isAllowedUrl : function (url) {
    // Check that url is allowed to be processed
    var allowed = false;

    for (var i=0; i < this.deniedUrls.length; i+=1) {
      if (url.match(this.deniedUrls[i])) {
        return false;
      }
    }

    for (var i=0; i < this.allowedUrls.length; i+=1) {
      if (url.match(this.allowedUrls[i])) {
        allowed = true;
      }
    }

    return allowed;
  },

  getInfo : function (url, data, done) {
    if (typeof(url) !== "string" || !this.isAllowedUrl(url)) {
      done(new Error(url + ' is not allowed for this scrapper'));
    }

    this.scrap(url, data, done);
  },

  scrap : function (url, data, done) {
    done(new Error('scrap Not Implemented'));
  }
});

module.exports = Scrapper;
