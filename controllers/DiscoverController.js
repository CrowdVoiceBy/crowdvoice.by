var dbLimit = 50 // how many posts we can ask for at a time

// counts up how many times it finds a number (ID according to
// `name`) so that we can tell which are trending.
var findTrending = function (resultFromKnex, name) {
  var amounts = {},
    result = []

  // get all the IDs
  var followed = resultFromKnex.map(function (val) {
    return val[name]
  })

  // find out how many times each number repeats
  followed.forEach(function (followedId) {
    if (amounts[followedId]) {
      amounts[followedId] += 1
    } else {
      amounts[followedId] = 1
    }
  })

  // convert to array
  for (var followedId in amounts) {
    result.push({
      id: followedId,
      count: amounts[followedId]
    })
  }

  // sort
  result.sort(function (a, b) {
    return b.count - a.count
  })

  return result.slice(0, dbLimit - 1)
}

var DiscoverController = Class('DiscoverController')({
  prototype: {
    newIndex: function (req, res, next) {
      res.render('discover/new')
    },

    newVoices: function(req, res, next) {
      async.waterfall([
        function (callback) {
          Voice.find(['status = ? ORDER BY created_at DESC LIMIT ?', [Voice.STATUS_PUBLISHED, dbLimit]], callback)
        },

        function (voices, callback) {
          VoicesPresenter.build(voices, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            res.locals.voices = result
            req.voices = result
            res.render('discover/new/voices')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    newPeople: function(req, res, next) {
      async.waterfall([
        function (callback) {
          Entity.find(['type = ? AND is_anonymous = ? ORDER BY created_at DESC LIMIT ?', ['person', false, dbLimit]],
            callback)
        },

        function (people, callback) {
          EntitiesPresenter.build(people, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            res.locals.people = result
            req.people = result
            res.render('discover/new/people')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    newOrganizations: function(req, res, next) {
      async.waterfall([
        function (callback) {
          Entity.find(['type = ? ORDER BY created_at DESC LIMIT ?', ['organization', dbLimit]],
            callback)
        },

        function (orgs, callback) {
          EntitiesPresenter.build(orgs, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            res.locals.organizations = result
            req.organizations = result
            res.render('discover/new/organizations')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    trendingIndex : function(req, res, next){
      res.render('discover/trending');
    },

    trendingVoices: function (req, res, next) {
      async.waterfall([
        function (callback) {
          VoiceFollower.all(callback)
        },

        function (allVoices, callback) {
          var trendingVoiceIds = findTrending(allVoices, 'voiceId').map(function (val) {
            return val.id
          })
          Voice.whereIn('id', trendingVoiceIds, callback)
        },

        function (voices, callback) {
          callback(null, voices.filter(function (val) {
            return (val.status === Voice.STATUS_PUBLISHED)
          }))
        },

        function (trendingVoices, callback) {
          VoicesPresenter.build(trendingVoices, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            res.locals.voices = result
            req.voices = result
            res.render('discover/trending/voices')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    trendingPeople: function (req, res, next) {
      async.waterfall([
        function (callback) {
          Entity.find(['type = ? AND is_anonymous = ? LIMIT ?', ['person', false, dbLimit]],
            callback)
        },

        function (allPeople, callback) {
          var allPeopleIds = allPeople.map(function (val) {
            return val.id
          })
          EntityFollower.whereIn('followed_id', allPeopleIds, callback)
        },

        function (followedIds, callback) {
          var trendingPeopleIds = findTrending(followedIds, 'followedId').map(function (val) {
            return val.id
          })
          Entity.whereIn('id', trendingPeopleIds, callback)
        },

        function (trendingPeople, callback) {
          EntitiesPresenter.build(trendingPeople, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            res.locals.people = result
            req.people = result
            res.render('discover/trending/people')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    trendingOrganizations: function (req, res, next) {
      async.waterfall([
        function (callback) {
          Entity.find(['type = ? LIMIT ?', ['organization', dbLimit]], callback)
        },

        function (allOrgs, callback) {
          var orgsIds = allOrgs.map(function (val) {
            return val.id
          })
          EntityFollower.whereIn('followed_id', orgsIds, callback)
        },

        function (followedIds, callback) {
          var trendingOrgsIds = findTrending(followedIds, 'followedId').map(function (val) {
            return val.id
          })
          Entity.whereIn('id', trendingOrgsIds, callback)
        },

        function (trendingOrgs, callback) {
          EntitiesPresenter.build(trendingOrgs, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            res.locals.organizations = result
            req.organizations = result
            res.render('discover/trending/organizations')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    recommendedIndex: function (req, res, next) {
      if (!req.currentPerson) {
        return res.redirect('/login');
      }

      var items = [];
      var voices = [];
      var entities = [];
      var currentPerson;
      var person = new Entity(req.currentPerson);
      person.id = hashids.decode(req.currentPerson.id)[0]

      async.series([function(done) {
        person.owner(function (err, result) {
          if (err) { return done(err); }

          if (req.currentPerson.isAnonymous) {
            currentPerson = new Entity(result);
          } else {
            currentPerson = new Entity(person);
          }

          return done();
        });
      }, function(done) {
        // Get the voices that the currentPerson is following
        VoiceFollower.find({ entity_id : currentPerson.id }, function(err, result) {
          if (err) {
            return done(err);
          }

          var voiceIds = result.map(function(item) {
            return item.voiceId;
          });

          Voice.whereIn('id', voiceIds, function(err, result) {
            if (err) {
              return done(err);
            }

            var published = result.filter(function (voice) {
              return voice.status === Voice.STATUS_PUBLISHED
            });

            VoicesPresenter.build(published, req.currentPerson, function(err, result) {
              if (err) {
                return next(err);
              }

              voices = result;

              done();
            });
          });
        });
      }, function(done) {
        // Get the owners of the voices
        async.each(voices, function(voice, nextVoice) {
          Entity.find({ id : hashids.decode(voice.owner.id)[0] }, function(err, result) {
            if (err) {
              return nextVoice(err);
            }

            EntitiesPresenter.build(result, req.currentPerson, function(err, owners) {
              if (err) {
                return nextVoice(err);
              }

              var exists = items.filter(function(item) {
                if (item.owner.id === owners[0].id) {
                  return true;
                }
              });

              if (exists.length > 0) {
                return nextVoice();
              }

              items.push({
                type : 'voice',
                data : voice,
                owner : owners[0],
                voices : [],
                people : [],
                organizations : []
              });

              nextVoice();
            });
          });
        }, done);
      }, function(done) {
        // Get entities that the currentPerson follows
        EntityFollower.find({ 'follower_id' : currentPerson.id }, function(err, result) {
          if (err) {
            return done(err);
          }

          var entityIds = result.map(function(item) {
            return item.followedId;
          });

          Entity.whereIn('id', entityIds, function(err, result) {
            if (err) {
              return done(err);
            }

            EntitiesPresenter.build(result, req.currentPerson, function(err, result) {
              if (err) {
                return done(err);
              }

              entities = result;

              done();
            });
          });
        });
      }, function(done) {
        // Organzie the entities
        async.each(entities, function(entity, nextEntity) {
          var obj = {
            type : entity.type,
            data : entity,
            voices : [],
            people : [],
            organizations : []
          }

          if (entity.type === 'person') {

            var exists = items.filter(function(item) {
              if (item.owner.id === entity.id) {
                return true;
              }
            });

            if (exists.length > 0) {
              return nextEntity();
            }

            obj.owner = entity;
            items.push(obj);

            return nextEntity();
          } else {
            EntityOwner.find({ 'owned_id' : hashids.decode(entity.id)[0] }, function(err, result) {
              if (err) {
                return nextEntity(err);
              }

              Entity.find({ id : result[0].ownerId }, function(err, result) {
                if (err) {
                  return nextEntity(err);
                }

                EntitiesPresenter.build(result, req.currentPerson, function(err, owners) {
                  if (err) {
                    return nextEntity(err);
                  }

                  var exists = items.filter(function(item) {
                    if (item.owner.id === owners[0].id) {
                      return true;
                    }
                  });

                  if (exists.length > 0) {
                    return nextEntity();
                  }

                  obj.owner = owners[0];

                  items.push(obj);

                  return nextEntity();
                });
              });
            });
          }
        }, done);
      }, function(done) {
        // Get the voices followed by each owner of items array
        async.each(items, function(item, nextItem) {
          VoiceFollower.find({ 'entity_id' : hashids.decode(item.owner.id)[0] }, function(err, result) {
            if (err) {
              return nextItem(err);
            }

            var voiceIds = result.map(function(voiceFollower) {
              return voiceFollower.voiceId;
            });

            Voice.whereIn('id', voiceIds, function(err, result) {
              if (err) {
                return nextItem(err);
              }

              VoicesPresenter.build(result, req.currentPerson, function(err, voices) {
                if (err) {
                  return nextItem(err);
                }

                item.voices = voices;

                nextItem();
              });
            });
          });
        }, done);
      }, function(done) {
        // Get the entities followed by each owner of the items array

        async.each(items, function(item, nextItem) {
          EntityFollower.find({ 'follower_id' : hashids.decode(item.owner.id)[0] }, function(err, result) {
            if (err) {
              return nextItem(err);
            }

            var entityIds = result.map(function(entity) {
              return entity.followedId;
            });

            Entity.whereIn('id', entityIds, function(err, result) {
              if (err) {
                return nextItem(err);
              }

              EntitiesPresenter.build(result, req.currentPerson, function(err, entities) {
                if (err) {
                  return nextItem(err);
                }

                entities.forEach(function(entity) {
                  if (entity.type === 'person') {
                    item.people.push(entity);
                  } else {
                    item.organizations.push(entity);
                  }
                });

                nextItem();
              });
            });
          });
        }, done);
      }], function(err) {
        if (err) {
          return next(err);
        }

        items = items.filter(function(item) {
          if (item.voices.length !== 0 && item.people.length !== 0 && item.organizations !== 0) {
            return true;
          }
        });

        return res.format({
          html: function () {
            res.locals.recommended = items;
            res.render('discover/recommended')
          },
          json: function () {
            res.json(items);
          }
        });
      });
    },

    updatedVoices: function (req, res, next) {
      async.waterfall([
        function (callback) {
          Voice.all(callback)
        },

        function (allVoices, callback) {
          var voicesIds = allVoices.map(function (val) {
            return val.id
          })
          Post.whereIn('voice_id', voicesIds, callback)
        },

        function (posts, callback) {
          var mostVoicesIds = findTrending(posts, 'voiceId').map(function (val) {
            return val.id
          })
          Voice.whereIn('id', mostVoicesIds, callback)
        },

        function (voices, callback) {
          callback(null, voices.filter(function (val) {
            return (val.status === Voice.STATUS_PUBLISHED)
          }))
        },

        function (voices, callback) {
          VoicesPresenter.build(voices, req.currentPerson, callback)
        },
      ], function (err, result) {
        if (err) { return next(err) }

        res.format({
          html: function () {
            res.locals.updatedVoices = result
            req.updatedVoices = result
            res.render('discover/trending/updatedVoices')
          },
          json: function () {
            res.json(result)
          },
        })
      })
    },

    browseIndex : function(req, res, next){

      Topic.all(function(err, result) {
        if (err) {
          return done(err);
        }

        TopicsPresenter.build(result, function(err, topics) {
          if (err) {
            return done(err);
          }

          res.locals.topics = topics;
          res.render('discover/browse');
          //done();
        });
      });

    }

  },
})

module.exports = new DiscoverController()
