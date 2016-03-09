var sanitize = require("sanitize-html");
var EntitiesPresenter = require(path.join(process.cwd(), '/presenters/EntitiesPresenter.js'));
var VoicesPresenter = require(path.join(process.cwd(), '/presenters/VoicesPresenter.js'));

module.exports = function(req, res, next) {
  if (CONFIG.enableRedis) {
    res.locals.csrfToken = req.csrfToken();
  }

  if (CONFIG.enablePassport) {

    res.locals.currentUser = req.user;

    // Sessions and cookie expire;
    if (req.isAuthenticated() && req.session.cookie.expires) {
      if ((Date.now() >  req.session.cookie.expires.getTime())) {
        req.session.destroy(); // Session is expired
      } else {
        var expires;

        expires =  new Date(Date.now() + 3600000 * 24 * 365); //Add one more year

        req.session.cookie.expires = expires;

      }
    }
  }

  if (CONFIG.enableHashids) {
    res.locals.hashids = global.hashids;
  }

  req.session.backURL = req.header('Referrer') || '/';

  // Add currentPerson

  if (req.user) {
    var currentUser = new User(req.user);

    // Add Twitter Credentials to session
    if (req.user.twitterCredentials) {
      req.session.twitterAccessToken = req.user.twitterCredentials.accessToken;
      req.session.twitterAccessTokenSecret = req.user.twitterCredentials.accessTokenSecret;
    }

    if (req.session.isAnonymous) {
      currentUser.shadow(function(err, shadowEntity) {
        if (err) {
          return next(err);
        }

        currentUser.entity(function(err, entity) {
          if (err) {
            return next(err);
          }

          EntitiesPresenter.build([shadowEntity], entity, function(err, presenterResult) {
            if (err) {
              return next(err);
            }

            res.locals.currentPerson = presenterResult[0];
            req.currentPerson = presenterResult[0];

            req.role = 'Anonymous';

            async.series([
              // .ownedOrganizations, always empty
              function (next) {
                res.locals.currentPerson.ownedOrganizations = [];
                req.currentPerson.ownedOrganizations = [];

                return next();
              },

              // .organizations
              function (next) {
                Entity.findById(currentUser.entityId, function (err, currentPerson) {
                  EntityMembership.find({
                    member_id: currentPerson[0].id,
                    is_anonymous: true,
                  }, function (err, members) {
                    if (err) { return next(err); }

                    var ids = members.map(function (record) {
                      return record.entityId;
                    });

                    Entity.whereIn('id', ids, function (err, organizations) {
                      if (err) { return next(err); }

                      EntitiesPresenter.build(organizations, null, function (err, presented) {
                        if (err) { return next(err); }

                        res.locals.currentPerson.organizations = presented;
                        req.currentPerson.organizations = presented;

                        return next();
                      });
                    });
                  });
                });
              },

              // .ownedVoices
              function (nextSeries) {
                var anonEntity = new Entity(req.currentPerson);
                anonEntity.id = hashids.decode(anonEntity.id)[0];

                anonEntity.owner(function (err, owner) {
                  if (err) { return nextSeries(err); }

                  db.select('owned_id').from('EntityOwner')
                    .where('owner_id', '=', owner.id)
                    .asCallback(function (err, orgs) {
                      if (err) { return nextSeries(err); }

                      var entityIds = orgs.map(function (org) { return org.owned_id; });
                      entityIds.push(owner.id);

                      db.select('id').from('Voices')
                        .whereIn('owner_id', entityIds)
                        .asCallback(function (err, rows) {
                          if (err) { return nextSeries(err); }

                          var voiceIds = rows.map(function (row) { return hashids.encode(row.id) });

                          res.locals.currentPerson.ownedVoices = voiceIds;
                          req.currentPerson.ownedVoices = voiceIds;
                          console.log(voiceIds)

                          return nextSeries();
                        });
                    });
                });
              }
            ], next);
          });
        });
      });
    } else {
      currentUser.entity(function(err, entity) {
        if (err) {
          return next(err);
        }

        req.role = 'Person';

        var person = new Entity(entity);

        person.id = hashids.decode(person.id)[0];

        if (person.isAdmin === true) {
          req.role = 'Admin';
        }

        EntitiesPresenter.build([person], entity, function(err, presenterResult) {
          if (err) {
            return next(err);
          }

          presenterResult = presenterResult[0];

          res.locals.currentPerson = presenterResult;
          req.currentPerson = presenterResult;

          async.series([function(done) {

            // Get organizations owned by currentPerson or that currentPerson is member of
            person.organizations(function(err, organizations) {
              if (err) {
                return done(err);
              }

              organizations.forEach(function(organization) {
                organization.id = hashids.decode(organization.id)[0];
              });

              EntitiesPresenter.build(organizations, entity, function(err, result) {
                if (err) {
                  return done(err);
                }

                res.locals.currentPerson.organizations = result;
                req.currentPerson.organizations = result;

                done();
              });
            });
          }, function(done) {

            // Get Voices of type TYPE_CLOSED that are owned by currentPerson
            Voice.find({
              owner_id : person.id,
              status : Voice.STATUS_PUBLISHED,
              type : Voice.TYPE_CLOSED
            }, function(err, result) {
              if (err) {
                return done(err);
              }

              VoicesPresenter.build(result, entity, function(err, voices) {
                if (err) {
                  return done(err);
                }

                req.currentPerson.closedVoices = voices;
                res.locals.currentPerson.closedVoices = voices;

                return done();
              });
            });
          }, function(done) {

            // Get Voices Count of status STATUS_PUBLISHED;
            db('Voices').count('*').where({
              'owner_id' : person.id,
              status : Voice.STATUS_PUBLISHED
            }).asCallback(function(err, result) {
              if (err) {
                return done(err);
              }

              req.currentPerson.voicesCount = parseInt(result[0].count, 10);
              res.locals.currentPerson.voicesCount = parseInt(result[0].count, 10);

              return done();
            });

          }, function (done) {
            // Get Voices owned directly by user or owned by entities that user
            // is owner of

            EntityOwner.find({ owner_id: hashids.decode(req.currentPerson.id)[0] }, function (err, owners) {
              if (err) { return done(err); }

              var ids = owners.map(function (owner) { return owner.ownedId });
              ids.push(person.id);

              Voice.whereIn('owner_id', ids, function (err, voices) {
                if (err) { return done(err); }

                var result = voices.map(function (voice) { return hashids.encode(voice.id); });

                res.locals.currentPerson.ownedVoices = result;
                req.currentPerson.ownedVoices = result;

                var voiceTitles = voices.map(function(item) {
                  var voice = new Voice(item);

                  var images = {}

                  Object.keys(voice.imageMeta).forEach(function (version) {
                    images[version] = {
                      url: voice.image.url(version),
                      meta: voice.image.meta(version),
                    };
                  });

                  return {
                    id : hashids.encode(item.id),
                    name : sanitize(item.title),
                    type : item.type,
                    images: images
                  }
                });

                res.locals.currentPerson.voiceNames = voiceTitles;

                return done();
              });
            });
          }, function(done) {

            // Get Organizations owned by currentUser

            person.ownedOrganizations(function(err, organizations) {
              EntitiesPresenter.build(organizations, entity, function(err, result) {
                if (err) {
                  return done(err);
                }

                res.locals.currentPerson.ownedOrganizations = result;
                req.currentPerson.ownedOrganizations = result;

                done();
              });
            })
          }], function(err) {
            if (err) {
              return next(err);
            }

            req.session.currentPerson = req.currentPerson;

            next();
          });
        });
      });
    }

  } else {
    res.locals.currentPerson = null;
    req.currentPerson = null;
    req.role = 'Visitor'
    next();
  }

}
