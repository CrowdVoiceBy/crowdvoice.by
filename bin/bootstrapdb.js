var path = require('path');

var application = require(path.join(process.cwd(), 'lib', 'neonode-core'));

global.useGM = true;

// Load aws-sdk and S3
var AWS = require('aws-sdk');
global.amazonS3 = new AWS.S3(CONFIG.s3);

// Load image processors
global.sharp = require('sharp');
global.gm = require('gm');
gm = gm.subClass({ imageMagick: true });

CONFIG.database.logQueries = true;

// Topics
var topics = [
  {
    data : {
      name : 'Human Rights',
      slug : 'human-rights'
    },
    image : path.join(process.cwd(), '/public/generator/topics/human_rights.png')
  },
  {
    data : {
      name : 'Politics',
      slug : 'politics'
    },
    image : path.join(process.cwd(), '/public/generator/topics/politics.png')
  },
  {
    data : {
      name : 'Education',
      slug : 'education'
    },
    image : path.join(process.cwd(), '/public/generator/topics/education.png')
  },
  {
    data : {
      name : 'Health',
      slug : 'health'
    },
    image : path.join(process.cwd(), '/public/generator/topics/health.png')
  },
  {
    data : {
      name : 'Environment',
      slug : 'environment'
    },
    image : path.join(process.cwd(), '/public/generator/topics/environment.png')
  },
  {
    data : {
      name : 'Privacy',
      slug : 'privacy'
    },
    image : path.join(process.cwd(), '/public/generator/topics/privacy.png')
  }
];


async.each(topics, function(topic, done) {
  var topicInstance = new Topic({
    name : topic.data.name,
    slug : topic.data.slug
  });

  topicInstance.save(function(err, result) {
    if (err) {
      return done(err);
    }

    topicInstance.uploadImage('image', topic.image, function(err) {
      if (err) {
        return done(err);
      }

      topicInstance.save(done);
    });
  });
}, function(err) {
  if (err) {
    logger.info(err);
    logger.info(err.stack);
  }

  process.exit(0);
});
