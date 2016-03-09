'use strict';

var sanitizer = require('sanitize-html');

var sanitizerOptions = {
  allowedTags : [],
  allowedAttributes : []
}

var Scrapper = require(__dirname + '/scrapper.js');

var VimeoScrapper = Module('VimeoScrapper').includes(Scrapper)({
  allowedUrls : [
    /^https?:\/\/(?:www\.)?vimeo\.com\/(?:.*\/)?(\d+)/i
  ],

  scrap : function (url, data, done) {
    if (typeof(data) !== 'object') { return done(new Error('Invalid Data.')) }

    var video = data[0];

    var title =  sanitizer(video.title || '', sanitizerOptions);
    title = title.substr(0, 80);

    var description =  sanitizer(video.description || '', sanitizerOptions);
    description = description.substr(0, 180);


    done(null, {
      sourceUrl  : url,
      sourceType : 'video',
      sourceService : 'vimeo',
      title : title,
      description: description,
      images: [
        video.thumbnail_large
      ]
    });
  }
});

module.exports = VimeoScrapper;
