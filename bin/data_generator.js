#!/usr/bin/env node
var path = require('path');
var application = require(path.join(process.cwd(), 'lib', 'neonode-core'));

global.useGM = false;

// Load aws-sdk and S3
var AWS = require('aws-sdk');
global.amazonS3 = new AWS.S3(CONFIG.s3);

// Load image processors
global.sharp = require('sharp');
global.gm = require('gm');
gm = gm.subClass({ imageMagick: true });

var cpuLength = 1;

var casual = require('casual');

CONFIG.database.logQueries = true;

var data = {
  users : {},
  entities : {},
  organizations : {},
  voices : {},
  topics : {},
  invitations : {},
  feedActions: {}
};

var fse = require('fs-extra')

async.series([function(next) {
  // Delete all the old posts and entities images, to avoid wasting disk space
  // and to always have a clean environment.
  return async.parallel([
    function (doneParal) {
      return fse.remove(path.join(process.cwd(), 'public/uploads/development'), doneParal);
    },

    function (doneParal) {
      return fse.remove(path.join(process.cwd(), 'public/uploads/favicons'), doneParal);
    }
  ], next);
}, function(next) {
  var users = [
    {
      email    : 'tyrion@example.com',
      password : '12345678'
    },
    {
      email    : 'cersei@example.com',
      password : '12345678'
    },
    {
      email    : 'jamie@example.com',
      password : '12345678'
    },
    {
      email    : 'daenerys@example.com',
      password : '12345678'
    },
    {
      email    : 'jon@example.com',
      password : '12345678'
    },
    {
      email    : 'arya@example.com',
      password : '12345678'
    },
    {
      email    : 'eddard@example.com',
      password : '12345678'
    },
    {
      email    : 'stannis@example.com',
      password : '12345678'
    },
    {
      email    : 'robert@example.com',
      password : '12345678'
    },
    {
      email    : 'joffrey@example.com',
      password : '12345678'
    }
  ];

  async.each(users, function(user, nextUser) {
    var userInstance = new User(user);

    userInstance.save(function(err, result) {
      if (err) {
        return nextUser(err);
      }

      userInstance.token = null;

      userInstance.save(function(err, result) {
        if (err) {
          return nextUser(err);
        }

        data.users[userInstance.email] = userInstance;

        nextUser();
      });
    });
  }, next);
}, function(next) {
  // Entities

  var entities = [
    {
      data : {
        type        : 'person',
        name        : 'Tyrion Lannister',
        profileName : 'tyrion-lannister',
        isAnonymous : false,
        isAdmin     : true,
        description : 'Tyrion Lannister is a fictional character in the A Song of Ice and Fire series of fantasy novels.',
        location : 'King\'s Landing'
      },
      user : data.users['tyrion@example.com'],
      image : path.join(process.cwd(), '/public/generator/users/tyrion.jpg'),
      background : path.join(process.cwd(), '/public/generator/users/tyrion-background.jpg')
    },
    {
      data : {
        type        : 'person',
        name        : 'Cersei Lannister',
        profileName : 'cersei-lannister',
        isAnonymous : false,
        isAdmin     : true,
        description : 'Cersei Lannister is the eldest child of Tywin and Joanna Lannister by mere moments, and the twin sister of Jamie Lannister.',
        location : 'King\'s Landing'
      },
      user : data.users['cersei@example.com'],
      image : path.join(process.cwd(), '/public/generator/users/cersei.jpg'),
      background : path.join(process.cwd(), '/public/generator/users/cersei-background.jpg')
    },
    {
      data : {
        type        : 'person',
        name        : 'Jamie Lannister',
        profileName : 'jamie-lannister',
        isAnonymous : false,
        description : 'Ser Jamie Lannister, known as the Kingslayer, is a knight from House Lannister.',
        location : 'King\'s Landing'
      },
      user : data.users['jamie@example.com'],
      image : path.join(process.cwd(), '/public/generator/users/jamie.jpg'),
      background : path.join(process.cwd(), '/public/generator/users/jamie-background.jpg')
    },
    {
      data : {
        type        : 'person',
        name        : 'Daenerys Targaryen',
        profileName : 'daenerys-targaryen',
        isAnonymous : false,
        description : 'Daenerys Targaryen, known as Daenerys Stormborn and Dany, is one of the last confirmed members of House Targaryen.',
        location : 'Meereen'
      },
      user : data.users['daenerys@example.com'],
      image : path.join(process.cwd(), '/public/generator/users/daenerys.jpg'),
      background : path.join(process.cwd(), '/public/generator/users/daenerys-background.jpg')
    },
    {
      data : {
        type        : 'person',
        name        : 'Jon Snow',
        profileName : 'jon-snow',
        isAnonymous : false,
        description : 'Jon Snow is the bastard son of Eddard Stark, by a mother whose identity is a source of speculation.',
        location : 'The Wall'
      },
      user : data.users['jon@example.com'],
      image : path.join(process.cwd(), '/public/generator/users/jon.jpg'),
      background : path.join(process.cwd(), '/public/generator/users/jon-background.jpg')
    },
    {
      data : {
        type        : 'person',
        name        : 'Arya Stark',
        profileName : 'arya-stark',
        isAnonymous : false,
        description : 'Arya Stark is the third child and second daughter of Lord Eddard Stark and Lady Catelyn Tully.',
        location : 'Winterfell'
      },
      user : data.users['arya@example.com'],
      image : path.join(process.cwd(), '/public/generator/users/arya.jpg'),
      background : path.join(process.cwd(), '/public/generator/users/arya-background.jpg')
    },
    {
      data : {
        type        : 'person',
        name        : 'Eddard Stark',
        profileName : 'eddard-stark',
        isAnonymous : false,
        description : 'Eddard Stark, also affectionately called "Ned", is the head of House Stark, Lord of Winterfell.',
        location : 'Winterfell'
      },
      user : data.users['eddard@example.com'],
      image : path.join(process.cwd(), '/public/generator/users/eddard.jpg'),
      background : path.join(process.cwd(), '/public/generator/users/eddard-background.jpg')
    },
    {
      data : {
        type        : 'person',
        name        : 'Stannis Baratheon',
        profileName : 'stannis-baratheon',
        isAnonymous : false,
        description : 'Stannis Baratheon is the head of House Baratheon of Dragonstone and the Lord of Dragonstone.',
        location : 'Dragonstone'
      },
      user : data.users['stannis@example.com'],
      image : path.join(process.cwd(), '/public/generator/users/stannis.png'),
      background : path.join(process.cwd(), '/public/generator/users/stannis-background.jpg')
    },
    {
      data : {
        type        : 'person',
        name        : 'Robert Baratheon',
        profileName : 'robert-baratheon',
        isAnonymous : false,
        description : 'King Robert I Baratheon is the Lord of the Seven Kingdoms of Westeros and the head of House Baratheon of King\'s Landing.',
        location : 'Dragonstone'
      },
      user : data.users['robert@example.com'],
      image : path.join(process.cwd(), '/public/generator/users/robert.jpg'),
      background : path.join(process.cwd(), '/public/generator/users/robert-background.jpg')
    },
    {
      data : {
        type        : 'person',
        name        : 'Joffrey Baratheon',
        profileName : 'joffrey-baratheon',
        isAnonymous : false,
        description : null,
        location : 'King\s Landing'
      },
      user : data.users['joffrey@example.com'],
      image : path.join(process.cwd(), '/public/generator/users/joffrey.jpg'),
      background : path.join(process.cwd(), '/public/generator/users/joffrey-background.jpg')
    }
  ];

  async.eachLimit(entities, cpuLength, function(entity, nextEntity) {
    var entityInstance = new Entity(entity.data);

    entityInstance.save(function(err, result) {
      if (err) {
        return nextEntity(err);
      }

      entityInstance.uploadImage('image', entity.image, function(err) {
        if (err) {
          return nextEntity(err);
        }

        entityInstance.uploadImage('background', entity.background, function(err) {
          if (err) {
            return nextEntity(err);
          }

          entityInstance.save(function(err, result) {
            if (err) {
              return nextEntity(err);
            }

            entity.user.entityId = entityInstance.id;

            entity.user.save(function(err, result) {
              if (err) {
                return nextEntity(err);
              }

              var shadowEntity = new Entity({
                type : 'person',
                name : 'Anonymous',
                profileName : 'anonymous_' + hashids.encode(entityInstance.id + new Date().getTime() + Math.round(Math.random() * 1000)),
                isAnonymous : true
              });

              shadowEntity.save(function(err, result) {
                if (err) {
                  return nextEntity(err);
                }

                entityInstance.setOwnershipTo(shadowEntity, function(err, result) {
                  if (err) {
                    return nextEntity(err);
                  }

                  data.entities[entityInstance.profileName] = entityInstance;

                  nextEntity();
                });
              });
            });
          });
        });
      });
    });
  }, next);
}, function(next) {

  // Organizations

  var organizations = [
    {
      data : {
        type        : 'organization',
        name        : 'House Stark',
        profileName : 'house-stark',
        isAnonymous : false,
        description : 'House Stark was one of the Great Houses of Westeros, ruling over the vast region known as the North from their seat in Winterfell.',
        location : 'Winterfell'
      },
      owner : data.entities['eddard-stark'],
      members : [data.entities['arya-stark']],
      image : path.join(process.cwd(), '/public/generator/organizations/house-stark.jpg'),
      background : path.join(process.cwd(), '/public/generator/organizations/house-stark-background.jpg')
    },
    {
      data : {
        type        : 'organization',
        name        : 'House Lannister',
        profileName : 'house-lannister',
        isAnonymous : false,
        description : 'House Lannister of Casterly Rock is one of the Great Houses of Westeros.',
        location : 'Casterly Rock'
      },
      owner : data.entities['cersei-lannister'],
      members : [data.entities['jamie-lannister'], data.entities['tyrion-lannister']],
      image : path.join(process.cwd(), '/public/generator/organizations/house-lannister.png'),
      background : path.join(process.cwd(), '/public/generator/organizations/house-lannister-background.jpg')
    },
    {
      data : {
        type        : 'organization',
        name        : 'House Targaryen',
        profileName : 'house-targaryen',
        isAnonymous : false,
        description : 'House Targaryen is one of the former Great Houses of Westeros and the previous ruling royal house of the Seven Kingdoms.',
        location : 'Valyria'
      },
      owner : data.entities['daenerys-targaryen'],
      members : [],
      image : path.join(process.cwd(), '/public/generator/organizations/house-targaryen.jpg'),
      background : path.join(process.cwd(), '/public/generator/organizations/house-targaryen-background.jpg')
    },
    {
      data : {
        type        : 'organization',
        name        : 'House Baratheon',
        profileName : 'house-baratheon',
        isAnonymous : false,
        description : 'House Baratheon is one of the Great Houses of Westeros, although also one of the youngest.',
        location : 'King\'s Landing'
      },
      owner : data.entities['robert-baratheon'],
      members : [data.entities['stannis-baratheon']],
      image : path.join(process.cwd(), '/public/generator/organizations/house-baratheon.JPG'),
      background : path.join(process.cwd(), '/public/generator/organizations/house-baratheon-background.png')
    }
  ];

  async.eachLimit(organizations, cpuLength, function(organization, nextOrganization) {
    var entityInstance = new Entity(organization.data);

    entityInstance.save(function(err, result) {
      if (err) {
        return nextOrganization(err);
      }

      entityInstance.uploadImage('image', organization.image, function(err) {
        if (err) {
          return nextOrganization(err);
        }

        entityInstance.uploadImage('background', organization.background, function(err) {
          if (err) {
            return nextOrganization(err);
          }

          entityInstance.save(function(err, result) {
            if (err) {
              return nextOrganization(err);
            }

            data.organizations[entityInstance.profileName] = entityInstance;

            // Set owner
            organization.owner.ownOrganization(entityInstance, function(err, result) {
              if (err) {
                return nextOrganization(err);
              }

              // Set members
              async.each(organization.members, function(member, nextMember) {
                entityInstance.addMember(member, nextMember);
              }, nextOrganization);
            });
          });
        })
      });
    });
  }, next);
}, function (next) {
  // NOTE: WHEN ADDING NEW FEED ACTIONS YOU NEED TO UPDATE THIS!!
  var defaults = {
    selfNewMessage: true,
    selfNewInvitation: true,
    selfNewRequest: true,
    selfNewVoiceFollower: true,
    selfNewEntityFollower: true
  }

  Entity.find({ is_anonymous: false }, function (err, entities) {
    if (err) { return next(err); }

    var ids = entities.map(function (entity) {
        return entity.id;
      }),
      notification;

    async.each(ids, function (id, next) {
      notification = new NotificationSetting({
        entityId: id,
        webSettings: defaults,
        emailSettings: defaults
      });
      notification.save(next);
    }, next);
  });

}, function(next) {

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

        data.topics[topicInstance.slug] = topicInstance;

        topicInstance.save(done);
      });
    });
  }, next);
}, function(next) {
  // Voices
  var voices = [

    // Tyrion
    {
      data : {
        title         : 'The Battle of the Blackwater',
        description   : 'The Battle of the Blackwater is the largest battle in the War of the Five Kings.',
        ownerId       : data.entities['tyrion-lannister'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Mouth of the Blackwater Rush'
      },
      image : path.join(process.cwd(), '/public/generator/voices/blackwater-background.jpg'),
      slug  : 'blackwater-battle',
      topics : ['politics', 'environment'],
      collaborators: [],
      relatedVoices: [2]
    },
    {
      data : {
        title         : 'Second Trial by Combat',
        description   : 'The Second Trial by Combat of Tyrion Lannister is an event in the War of the Five Kings.',
        ownerId       : data.entities['tyrion-lannister'].id + 1, // Anonymous
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Kings Landing'
      },
      image : path.join(process.cwd(), '/public/generator/voices/second-trial-by-combat.jpg'),
      slug  : 'second-trial-by-combat',
      topics : ['human-rights'],
      collaborators: [],
      relatedVoices: []
    },
    {
      data : {
        title         : 'War of the Five Kings',
        description   : 'The War of the Five Kings is a large, multi-theater conflict fought in the Seven Kingdoms.',
        ownerId       : data.entities['tyrion-lannister'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_CLOSED,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Westeros'
      },
      image : path.join(process.cwd(), '/public/generator/voices/5kings-background.jpg'),
      slug  : 'war-of-the-5-kings',
      topics : ['politics'],
      collaborators: [],
      relatedVoices: []
    },
    {
      data : {
        title         : 'Valyrian roads',
        description   : 'Valyrian roads are broad stone highways built when the Valyrian Freehold dominated Essos.',
        ownerId       : data.entities['tyrion-lannister'].id,
        status        : Voice.STATUS_DRAFT,
        type          : Voice.TYPE_CLOSED,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Valyria'
      },
      image : path.join(process.cwd(), '/public/generator/voices/valyrian-roads.png'),
      slug  : 'valyrian-roads',
      topics : ['politics', 'environment', 'education'],
      collaborators: [data.entities['jamie-lannister']],
      relatedVoices: []
    },
    {
      data : {
        title         : 'The Second Siege of Meereen',
        description   : 'Yunkai and her allies march on Meereen in order to cast down Queen Daenerys Targaryen.',
        ownerId       : data.entities['tyrion-lannister'].id,
        status        : Voice.STATUS_UNLISTED,
        type          : Voice.TYPE_CLOSED,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Valyria'
      },
      image : path.join(process.cwd(), '/public/generator/voices/siege-to-mereen.png'),
      slug  : 'meereen-siege',
      topics : ['politics', 'human-rights', 'environment', 'privacy'],
      collaborators: [],
      relatedVoices: []
    },

    // Cersei
    {
      data : {
        title         : 'Walk of atonement',
        description   : 'A walk of atonement is a punishment in the Seven Kingdoms usually reserved to punish.',
        ownerId       : data.entities['cersei-lannister'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Kings Landing'
      },
      image : path.join(process.cwd(), '/public/generator/voices/walk-of-shame.jpg'),
      slug  : 'walk-of-atonement',
      topics : ['human-rights'],
      collaborators: [],
      relatedVoices: []
    },
    {
      data : {
        title         : 'The dead of Jon Arryn',
        description   : 'Lord Jon Arryn was the head of House Arryn, whose titles included Lord of the Eyrie.',
        ownerId       : data.entities['cersei-lannister'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_CLOSED,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Kings Landing'
      },
      image : path.join(process.cwd(), '/public/generator/voices/dead-of-arryn.jpg'),
      slug  : 'dead-of-arryn',
      topics : ['politics', 'health'],
      collaborators: [],
      relatedVoices: []
    },

    // Jamie
    {
      data : {
        title         : 'Robert\'s Rebellion',
        description   : 'Robert\'s Rebellion, also known as the War of the Usurper.',
        ownerId       : data.entities['jamie-lannister'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Kings Landing'
      },
      image : path.join(process.cwd(), '/public/generator/voices/roberts-rebelion.jpg'),
      slug  : 'roberts-rebelion',
      topics : ['politics'],
      collaborators: [],
      relatedVoices: []
    },

    // Daenerys
    {
      data : {
        title         : 'Siege of Meereen',
        description   : 'The siege of Meereen occurs in 299 AC when Daenerys Targaryen marches on Meereen.',
        ownerId       : data.entities['daenerys-targaryen'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Essos'
      },
      image : path.join(process.cwd(), '/public/generator/voices/road-to-meereen.jpg'),
      slug  : 'meereen',
      topics : ['politics', 'human-rights', 'education'],
      collaborators: [],
      relatedVoices: []
    },
    {
      data : {
        title         : 'A Dance with Dragons',
        description   : 'Dany struggles as ruler of Meereen, mainly due to the constant threats surrounding her.',
        ownerId       : data.entities['daenerys-targaryen'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Meereen'
      },
      image : path.join(process.cwd(), '/public/generator/voices/dance-dragons.jpg'),
      slug  : 'a-dance-with-dragons',
      topics : ['environment'],
      collaborators: [],
      relatedVoices: []
    },

    // Jon
    {
      data : {
        title         : 'Battle of Castle Black',
        description   : 'The Battle of Castle Black takes place during the War of the Five Kings at Castle Black along the Wall in the North.',
        ownerId       : data.entities['jon-snow'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Castle Black'
      },
      image : path.join(process.cwd(), '/public/generator/voices/castle-black.jpg'),
      slug  : 'battle-of-castle-black',
      topics : ['politics'],
      collaborators: [],
      relatedVoices: []
    },
    {
      data : {
        title         : 'White Walkers',
        description   : 'The White Walkers are a mythological race mentioned in ancient legends and stories from the time of the First Men and the Children of the Forest.',
        ownerId       : data.entities['jon-snow'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Beyond the wall'
      },
      image : path.join(process.cwd(), '/public/generator/voices/white-walkers.png'),
      slug  : 'white-walkers',
      topics : ['health'],
      collaborators: [],
      relatedVoices: []
    }
  ];

  async.eachLimit(voices, cpuLength, function(voice, nextVoice) {
    var voiceInstance = new Voice(voice.data);

    voiceInstance.save(function(err, result) {
      if (err) {
        return nextVoice(err);
      }

      voiceInstance.uploadImage('image', voice.image, function(err) {
        if (err) {
          return nextVoice(err);
        }

        voiceInstance.save(function(err, result) {
          if (err) {
            return nextVoice(err);
          }

          var slug = new Slug({
            voiceId : voiceInstance.id,
            url : voice.slug
          });

          slug.save(function(err, result) {
            if (err) {
              return nextVoice(err);
            }

            async.each(voice.topics, function(topic, nextTopic) {
              var voiceTopic = new VoiceTopic({
                voiceId : voiceInstance.id,
                topicId : data.topics[topic].id
              });

              voiceTopic.save(nextTopic);
            }, function(err) {
              if (err) {
                return nextVoice(err);
              }

              data.voices[slug.url] = voiceInstance;

              async.each(voice.collaborators, function (collaborator, nextCollab) {
                var collab = new VoiceCollaborator({
                  voiceId: voiceInstance.id,
                  collaboratorId: collaborator.id,
                  is_anonymous: false
                });

                collab.save(nextCollab);
              }, function(err) {
                if (err) {
                  return nextVoice(err);
                }

                async.each(voice.relatedVoices, function (relatedVoiceId, nextRelated) {
                  var related = new RelatedVoice({
                    voiceId: voiceInstance.id,
                    relatedId: relatedVoiceId
                  });

                  related.save(nextRelated);
                }, nextVoice)
              });
            });
          });
        });
      });
    });
  }, next);
}, function(next) {

  // Voices by organizations
  var voices = [
    {
      data : {
        title         : 'Winterfell',
        description   : 'Winterfell is the seat of House Bolton (formerly House Stark).',
        ownerId       : data.organizations['house-stark'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Winterfell'
      },
      image : path.join(process.cwd(), '/public/generator/voices/winterfell-background.jpg'),
      slug  : 'winterfell',
      topics : ['human-rights']
    },
    {
      data : {
        title         : 'Bran the Builder',
        description   : 'Brandon Stark, also known as Brandon the Builder and Bran the Builder.',
        ownerId       : data.organizations['house-stark'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'The Wall'
      },
      image : path.join(process.cwd(), '/public/generator/voices/bran-background.jpg'),
      slug  : 'bran-the-builder',
      topics : ['education', 'politics']
    },
    {
      data : {
        title         : 'Casterly Rock',
        description   : 'Casterly Rock, nicknamed the Rock, is a fortress and the seat of House Lannister.',
        ownerId       : data.organizations['house-lannister'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'Casterly Rock'
      },
      image : path.join(process.cwd(), '/public/generator/voices/casterly-rock.jpg'),
      slug  : 'casterly-rock',
      topics : ['health']
    },
    {
      data : {
        title         : 'King\'s Landing',
        description   : 'King\'s Landing is the capital of the Seven Kingdoms. It is located on the east coast of Westeros in the Crownlands.',
        ownerId       : data.organizations['house-baratheon'].id,
        status        : Voice.STATUS_PUBLISHED,
        type          : Voice.TYPE_PUBLIC,
        latitude      : '4.815',
        longitude     : '162.342',
        locationName  : 'King\'s Landing'
      },
      image : path.join(process.cwd(), '/public/generator/voices/kings-landing.jpg'),
      slug  : 'kings-landing',
      topics : ['politics', 'human-rights', 'health']
    }
  ];

  async.eachLimit(voices, cpuLength, function(voice, nextVoice) {
    var voiceInstance = new Voice(voice.data);

    voiceInstance.save(function(err, result) {
      if (err) {
        return nextVoice(err);
      }

      voiceInstance.uploadImage('image', voice.image, function(err) {
        if (err) {
          return nextVoice(err);
        }

        voiceInstance.save(function(err, result) {
          if (err) {
            return nextVoice(err);
          }

          var slug = new Slug({
            voiceId : voiceInstance.id,
            url : voice.slug
          });

          slug.save(function(err, result) {
            if (err) {
              return nextVoice(err);
            }

            async.each(voice.topics, function(topic, nextTopic) {
              var voiceTopic = new VoiceTopic({
                voiceId : voiceInstance.id,
                topicId : data.topics[topic].id
              });

              voiceTopic.save(nextTopic);
            }, function(err) {
              if (err) {
                return nextVoice(err);
              }

              data.voices[slug.url] = voiceInstance;
              nextVoice();
            });
          });
        });
      });
    });
  }, next);

}, function(next) {

  // Invitations

  var invitations = [
    {
      data: {
        invitatorEntityId: data.entities['cersei-lannister'].id,
        invitedEntityId: data.entities['arya-stark'].id,
      },
      invitator: data.entities['cersei-lannister'].profileName,
      invited: data.entities['arya-stark'].profileName,
    },
    {
      data: {
        invitatorEntityId: data.entities['jon-snow'].id,
        invitedEntityId: data.entities['jamie-lannister'].id,
      },
      invitator: data.entities['jon-snow'].profileName,
      invited: data.entities['jamie-lannister'].profileName,
    },
  ];

  async.each(invitations, function (invite, done) {
    var invitation = new InvitationRequest(invite.data);

    invitation.save(function (err) {
      if (err) { return done(err); }

      data.invitations[invite.invitator + '-to-' + invite.invited] = invitation;

      return done();
    });
  }, next);

}, function(next) {

  // FeaturedVoices
  var featured = [
    data.voices.meereen,
    data.voices['second-trial-by-combat'],
    data.voices['blackwater-battle'],
    data.voices['meereen-siege'],
    data.voices['battle-of-castle-black'],
    data.voices['walk-of-atonement'],
    data.voices['kings-landing'],
    data.voices['valyrian-roads']
  ];

  async.each(featured, function(voice, nextFeatured) {
    var featuredVoice = new FeaturedVoice({
      voiceId : voice.id,
      position : featured.indexOf(voice) || 0
    });

    featuredVoice.save(nextFeatured);
  }, next);
}, function(next) {

  // Featured people
  var featured = [
    data.entities['tyrion-lannister'],
    data.entities['jon-snow'],
    data.entities['cersei-lannister']
  ];

  async.each(featured, function(person, nextPerson) {
    var featuredPerson = new FeaturedPerson({
      entityId : person.id,
      position : featured.indexOf(person) || 0
    });

    featuredPerson.save(nextPerson);
  }, next);
}, function(next) {

  // Featured organizations
  var featured = [
    data.organizations['house-lannister'],
    data.organizations['house-stark'],
    data.organizations['house-targaryen']
  ];

  async.each(featured, function(organization, nextOrganization) {
    var featuredOrganization = new FeaturedOrganization({
      entityId : organization.id,
      position : featured.indexOf(organization) || 0
    });

    featuredOrganization.save(nextOrganization);
  }, next);
}, function(next) {

  // Feed actions
  var actions = [
    // Jon followed voices
    {
      itemType: 'voice',
      itemId: data.voices.meereen.id,
      action: 'followed',
      who: 9, // Jon
    },
    {
      itemType: 'voice',
      itemId: data.voices.winterfell.id,
      action: 'followed',
      who: 9,
    },
    {
      itemType: 'voice',
      itemId: data.voices['casterly-rock'].id,
      action: 'followed',
      who: 9,
    }
  ];

  async.each(actions, function(action, nextAction) {
    var feedAction = new FeedAction(action);

    feedAction.save(function (err) {
      if (err) { return nextAction(err); }

      data.feedActions[feedAction.who + '-' +
        feedAction.action + '-' +
        feedAction.itemType + '-' +
        feedAction.itemId] = feedAction;

      return nextAction();
    })
  }, next);
}, function(next) {

  // Notifications
  var notifications = [
    // Jon followed voices
    {
      actionId: data.feedActions['9-followed-voice-9'].id,
      followerId: 3, // Cersei
      read: true,
      forFeed: true
    },
    {
      actionId: data.feedActions['9-followed-voice-13'].id,
      followerId: 3,
      read: true,
      forFeed: true
    },
    {
      actionId: data.feedActions['9-followed-voice-15'].id,
      followerId: 22, // House Lannister
      read: true,
      forFeed: true
    }
  ];

  async.each(notifications, function (notif, nextNotif) {
    var notification = new Notification(notif);

    notification.save(nextNotif)
  }, next);
}, function(next) {

  // Follow persons
  async.series([function(done) {
    data.entities['tyrion-lannister'].followEntity(data.entities['jamie-lannister'], done);
  }, function(done) {
    data.entities['cersei-lannister'].followEntity(data.entities['jamie-lannister'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followEntity(data.entities['cersei-lannister'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followEntity(data.entities['tyrion-lannister'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followEntity(data.entities['joffrey-baratheon'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followEntity(data.entities['robert-baratheon'], done);
  }, function(done) {
    data.entities['daenerys-targaryen'].followEntity(data.entities['tyrion-lannister'], done);
  }, function(done) {
    data.entities['jon-snow'].followEntity(data.entities['arya-stark'], done);
  }, function(done) {
    data.entities['jon-snow'].followEntity(data.entities['eddard-stark'], done);
  }, function(done) {
    data.entities['arya-stark'].followEntity(data.entities['jon-snow'], done);
  }, function(done) {
    data.entities['arya-stark'].followEntity(data.entities['eddard-stark'], done);
  }, function(done) {
    data.entities['eddard-stark'].followEntity(data.entities['arya-stark'], done);
  }, function(done) {
    data.entities['robert-baratheon'].followEntity(data.entities['cersei-lannister'], done);
  }, function(done) {
    data.entities['robert-baratheon'].followEntity(data.entities['jamie-lannister'], done);
  }, function(done) {
    data.entities['joffrey-baratheon'].followEntity(data.entities['cersei-lannister'], done);
  }, function(done) {
    data.entities['joffrey-baratheon'].followEntity(data.entities['jamie-lannister'], done);
  }], next);
}, function(next) {

  // Follow Voices and organizations

  async.series([function(done) {
    data.entities['tyrion-lannister'].followVoice(data.voices['walk-of-atonement'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followVoice(data.voices['dead-of-arryn'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followVoice(data.voices['casterly-rock'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followVoice(data.voices['kings-landing'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followVoice(data.voices['battle-of-castle-black'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followVoice(data.voices['white-walkers'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followVoice(data.voices['winterfell'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followVoice(data.voices['bran-the-builder'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followVoice(data.voices['roberts-rebelion'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followVoice(data.voices['meereen'], done);
  }, function(done) {
    data.entities['cersei-lannister'].followVoice(data.voices['casterly-rock'], done);
  }, function(done) {
    data.entities['cersei-lannister'].followVoice(data.voices['roberts-rebelion'], done);
  }, function(done) {
    data.entities['cersei-lannister'].followVoice(data.voices['winterfell'], done);
  }, function(done) {
    data.entities['cersei-lannister'].followVoice(data.voices['blackwater-battle'], done);
  }, function(done) {
    data.entities['cersei-lannister'].followVoice(data.voices['war-of-the-5-kings'], done);
  }, function(done)  {
    data.entities['cersei-lannister'].followVoice(data.voices['valyrian-roads'], done);
  }, function(done) {
    data.entities['cersei-lannister'].followVoice(data.voices['second-trial-by-combat'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followVoice(data.voices['blackwater-battle'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followVoice(data.voices['war-of-the-5-kings'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followVoice(data.voices['valyrian-roads'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followVoice(data.voices['meereen-siege'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followVoice(data.voices['second-trial-by-combat'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followVoice(data.voices['casterly-rock'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followVoice(data.voices['kings-landing'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followVoice(data.voices['winterfell'], done);
  }, function(done) {
    data.entities['jamie-lannister'].followVoice(data.voices['dead-of-arryn'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followEntity(data.organizations['house-stark'], done);
  }, function(done) {
    data.entities['tyrion-lannister'].followEntity(data.organizations['house-lannister'], done);
  }], next);

}, function(next) {

  // Threads And Messages

  async.series([function(done) {

    MessageThread.findOrCreate({
      senderPerson : data.entities['tyrion-lannister'],
      senderEntity : data.entities['tyrion-lannister'],
      receiverEntity : data.entities['jon-snow']
    }, function(err, thread) {
      if (err) {
        return done(err);
      }

      async.series([function(doneMessage) {
        thread.createMessage({
          senderPersonId : data.entities['tyrion-lannister'].id,
          message : 'Look at me and tell me what you see.'
        }, doneMessage);
      }, function(doneMessage) {
        thread.createMessage({
          senderPersonId : data.entities['jon-snow'].id,
          message : 'Is this a trick?'
        }, doneMessage);
      }, function(doneMessage) {
        thread.createMessage({
          senderPersonId : data.entities['tyrion-lannister'].id,
          message : 'What you see is a dwarf. If I had been born a peasant, they might have left me out in the woods to die. Alas, I was born a Lannister of Casterly Rock. Things are expected of me. My father was the Hand of the King for twenty years. '
        }, doneMessage);
      }, function(doneMessage) {
        thread.createMessage({
          senderPersonId : data.entities['jon-snow'].id,
          message : 'Until your brother killed that king.'
        }, doneMessage);
      }, function(doneMessage) {
        thread.createMessage({
          senderPersonId : data.entities['tyrion-lannister'].id,
          message : 'Yes. Until my brother killed him. Life is full of these little ironies. My sister married the new king, and my repulsive nephew will be king after him. I must do my part for the honor of my house; wouldn\'t you agree? But how? Well, my brother has his sword, and I have my mind. And a mind needs books like a sword needs a whetstone. That\'s why I read so much, Jon Snow. '
        }, doneMessage);
      }], done);
    })

  }, function (done) {

    MessageThread.findOrCreate({
      senderPerson : data.entities['cersei-lannister'],
      senderEntity : data.entities['cersei-lannister'],
      receiverEntity : data.entities['arya-stark'],
    }, function (err, thread) {
      if (err) { return done(err); }

      async.series([
        function (doneMessage) {
          thread.createMessage({
            senderPersonId: data.entities['cersei-lannister'].id,
            message: '9903255846',
            type: 'invitation_organization',
            invitationRequestId: data.invitations['cersei-lannister-to-arya-stark'].id,
            organizationId: data.organizations['house-lannister'].id,
          }, doneMessage);
        },
      ], done);
    });

  }, function (done) {

    MessageThread.findOrCreate({
      senderPerson : data.entities['jon-snow'],
      senderEntity : data.entities['jon-snow'],
      receiverEntity : data.entities['jamie-lannister'],
    }, function (err, thread) {
      if (err) { return done(err); }

      async.series([
        function (doneMessage) {
          thread.createMessage({
            senderPersonId: data.entities['jon-snow'].id,
            message: '5275170667',
            type: 'invitation_voice',
            invitationRequestId: data.invitations['jon-snow-to-jamie-lannister'].id,
            voiceId: data.voices['white-walkers'].id,
          }, doneMessage);
        },
      ], done);
    });

  }], next);
}, function(next) {

  var times = parseInt(process.argv[2], 10);

  if (!times || typeof times === NaN || times === 0) {
    return next();
  }

  // Posts
  Voice.all(function(err, voices) {
    if (err) { return next(err); }

    async.eachLimit(voices, 1, function(voice, done) {
      var year = 2015;
      var month = 5;

      var count = 0;
      var youtubes = [
        'https://www.youtube.com/watch?v=tHX55Bxnc-A',
        'https://www.youtube.com/watch?v=kNSv7DF5QrY',
        'https://www.youtube.com/watch?v=EH5E2dJx91E',
        'https://www.youtube.com/watch?v=tHX55Bxnc-A',
        'https://www.youtube.com/watch?v=f4RGU2jXQiE'
      ];

      async.timesLimit(times, 1, function(id, nextPost) {
        var post =  new Post();

        var type = casual['random_element'](['image', 'video', 'link']);

        post.title = casual.title;
        post.description = casual.description.substr(0, 62);

        post.sourceType = type;

        if (type === 'video') {
          post.sourceService = 'youtube';
          post.sourceUrl = casual['random_element'](youtubes) + '?' + casual.random;
        } else {
          post.sourceService = 'link';
          post.sourceUrl = 'http://google.com/'  + '?' + casual.random;
        }

        post.approved = casual['random_element']([true, false]);

        var date =  new Date(year + '-' + month + '-' + casual.integer(from = 1, to = 28));
        post.createdAt = date;
        post.updatedAt = date;
        post.publishedAt = date;

        post.voiceId = voice.id;
        post.ownerId = voice.ownerId;
        count++;

        if (count === 50) {
          month--;
          count = 0;
        }

        if (month === 0) {
          month = 12;
          year--;
        }

        var width = casual.integer(from = 200, to = 350);
        var height = casual.integer(from = 100, to = 400);

        if (type === 'video') {
          width = 350;
          hegith = 197;
        };

        var url = path.join(process.cwd(), '/public/generator/posts/' + casual.integer(from = 1, to = 18) + '.jpg');

        post.save(function(err, postRes) {
          if (err) {
            return nextPost(err);
          }

          post.uploadImage('image', url, function(err) {
            if (err) { return nextPost(err); }

            post.save(function(err, result) {
              if (err) { return nextPost(err); }

              var fibonacci = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987];

              if (!post.approved) {
                async.series([
                  // VOTES UP
                  function (nextSeries) {
                    async.times(casual.random_element(fibonacci), function (n, doneTime) {
                      var vote = new Vote({
                        value: +1,
                        postId: post.id,
                        entityId: 0,
                        ip: '127.0.0.1'
                      });

                      vote.save(function (err) {
                        if (err) { return doneTime(err); }

                        return doneTime(null, vote);
                      });
                    }, nextSeries);
                  },

                  // VOTES DOWN
                  function (nextSeries) {
                    async.times(casual.random_element(fibonacci), function (n, doneTime) {
                      var vote = new Vote({
                        value: -1,
                        postId: post.id,
                        entityId: 0,
                        ip: '127.0.0.1'
                      });

                      vote.save(function (err) {
                        if (err) { return doneTime(err); }

                        return doneTime(null, vote);
                      });
                    }, nextSeries);
                  },
                ], function (err) {
                  if (err) { return nextPost(err); }

                  return nextPost(null, post);
                });
              } else {
                return nextPost(null, post);
              }
            });
          });
        });

      }, done);

    }, next);
  });

}], function(err) {
  if (err) {
    logger.error(err);
    console.error(data);
    return process.exit(1);
  }

  console.log('FINISHED SUCCESSFULLY!');
  process.exit(0);
});
