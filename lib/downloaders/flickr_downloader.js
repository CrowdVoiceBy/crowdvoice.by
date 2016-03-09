'use strict';

var downloader = require(__dirname + '/downloader.js');
var sa = require('superagent');
var async = require('async');

var FlickrDownloader = Module('FlickrDownloader').includes(Downloader)({
  allowedUrls : [
    /^https?:\/\/(?:www\.)?flickr\.com\/photos\/[-\w@]+\/\d+/i
  ],

  retrieveData : function (url, response, done) {
    if (!url.match(/\/photos\/.*\/(\d+)(?:\/.*)?$/)) {
      return done(new Error('Cannot process this flickr url'));
    }

    var photoId = url.match(/\/photos\/.*\/(\d+)(?:\/.*)?$/)[1];
    var apiData = {};
    var photos = [];

    // We make one call to get the image info and another to get
    // the source image and then we download the image.
    async.parallel([
      function (done) {
        var getInfo = sa.get('https://api.flickr.com/services/rest/')
        getInfo.query({
          method: 'flickr.photos.getInfo',
          api_key: '078ed08d1643d3899a05687e075495fe',
          photo_id: photoId,
          format: 'json',
          nojsoncallback: 1
        })
        getInfo.end(function (err, res) {
          apiData = res.body;
          done();
        });
      },
      function (done) {
        var source = '';
        var getSizes = sa.get('https://api.flickr.com/services/rest/')
        getSizes.query({
          method: 'flickr.photos.getSizes',
          api_key: '078ed08d1643d3899a05687e075495fe',
          photo_id: photoId,
          format: 'json',
          nojsoncallback: 1
        });
        getSizes.end(function (err, res) {
          var sizes = res.body.sizes.size;
          for (var i=0; i < sizes.length; i+=1) {
            if (sizes[i].label === 'Large' ||
                sizes[i].label === 'Original') {
              source = sizes[i].source.replace('https', 'http');
              break;
            }
          }

          photos.push(source);
          done();
        });
      }
    ], function (err) {
      apiData.photo.images = photos;
      done(err, apiData);
    });
  }
});

module.exports = FlickrDownloader;
