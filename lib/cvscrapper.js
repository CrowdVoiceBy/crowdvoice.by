'use strict';
var baseDir = __dirname;

// Load external libraries
var async = require('async');
var fs = require('fs');

// Configuration in config/cvscrapper_config.json
var config = require(baseDir + '/../config/cvscrapper_config.json');

// Load downloaders
var downloaders = [];
config.downloaders.forEach(function (downloaderName) {
  downloaders.push(require(baseDir + '/downloaders/' + downloaderName + '_downloader'));
});

// Load scrappers
var scrappers = [];
config.scrappers.forEach(function (scrapperName) {
  scrappers.push(require(baseDir + '/scrappers/' + scrapperName + '_scrapper'));
});

var CVScrapper = Module('CVScrapper')({
  processUrl : function processUrl (url, res, done) {
    var scrapper = this;

    scrapper.downloadData(url, res, function (err, data) {
      if (err) { done(err); return; }

      // Process raw data
      scrapper.processData(url, data, function (err, info) {
        if (err) { done(err); return; }

        // Preprocess until 10 images
        var processedImages = [];

        async.each(info.images, function (image, nextImage) {
          if (processedImages.length > 10) { return nextImage(); }

          if (typeof(image) === 'object') {
            processedImages.push(image);
            return nextImage();
          }

          ImageDownloader.download(image, function (size) {
            return size.width >= 300;
          }, function (err, data) {
            if (err) {
              return nextImage(err);
            }

            if (data && processedImages.length < 10) {
              processedImages.push(data);
            }

            nextImage();
          });
        }, function (err) {
          if (err) {
            logger.error(err)
            return done(err)
          }

          info.images = processedImages;
          // Send result
          done(err, info);
        });
      });
    });
  },

  downloadData : function downloadData (url, res, done) {
    var scrapper = this, downloaded = false;

    for (var i=0; i < downloaders.length; i++) {
      if (downloaders[i].isAllowedUrl(url)) {
        downloaders[i].download(url, res, done);
        downloaded = true;
        break;
      }
    }

    if (!downloaded) {
      done(new Error('No downloader available for this url'));
    }
  },

  processData : function processData (url, data, done) {
    var scrapper = this, processed = false;

    for (var i=0; i < scrappers.length; i++) {
      if (scrappers[i].isAllowedUrl(url)) {
        scrappers[i].getInfo(url, data, done);
        processed = true;
        break;
      }
    }

    if (!processed) {
      done(new Error('No scrapper available for this url'));
    }
  }
});

module.exports = CVScrapper;
