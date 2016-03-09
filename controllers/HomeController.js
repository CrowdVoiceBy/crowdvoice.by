/* jshint multistr: true */

var VoicesPresenter = require(path.join(process.cwd(), '/presenters/VoicesPresenter'));
var TopicsPresenter = require(path.join(process.cwd(), '/presenters/TopicsPresenter'));
var EntitiesPresenter = require(path.join(process.cwd(), '/presenters/EntitiesPresenter'));

var isProfileNameAvailable = require(path.join(__dirname, '../lib/util/isProfileNameAvailable.js'));

var HomeController = Class('HomeController')({
  prototype : {
    index : function index(req, res, next) {
      // if the person is logged in, redirect to their feed
      if (req.currentPerson) {
        return res.redirect('/' + req.currentPerson.profileName + '/home');
      }

      ACL.isAllowed('show', 'homepage', req.role, {}, function(err, isAllowed) {
        if (err) { return next(err); }

        if (!isAllowed) {
          return next(new ForbiddenError());
        }

        async.series([function(done) {
          // FeaturedVoices
          FeaturedVoice.all(function(err, result) {
            if (err) { return done(err); }

            var featuredIds = result.map(function(item) {
              return item.voiceId;
            });

            Voice.whereIn('id', featuredIds, function(err, voicesResult) {
              if (err) { return done(err); }

              var publishedVoices = voicesResult.filter(function (voice) {
                return voice.status === Voice.STATUS_PUBLISHED;
              });

              VoicesPresenter.build(publishedVoices, req.currentPerson, function (err, voices) {
                if (err) { return done(err); }

                res.locals.featuredVoices = voices;

                done();
              });
            });
          });
        }, function(done) {
          Topic.all(function(err, result) {
            if (err) {
              return done(err);
            }

            TopicsPresenter.build(result, function(err, topics) {
              if (err) {
                return done(err);
              }

              res.locals.topics = topics;

              done();
            });
          });
        /*
        }, function(done) {
          db.raw('SELECT ' +
            'count(DISTINCT "Voices"."id") AS "voices_count", ' +
            'count(DISTINCT "EntityMembership"."id") AS "members_count", ' +
            '"Entities"."id" AS "org_id" ' +
            'FROM "Entities" ' +
            'LEFT JOIN "Voices" ' +
            'ON "Entities"."id" = "Voices"."owner_id" ' +
            'LEFT JOIN "EntityMembership" ' +
            'ON "Entities"."id" = "EntityMembership"."entity_id" ' +
            'WHERE "Entities"."type" = ? ' +
            'AND "Entities"."deleted" = ? ' +
            'AND "Voices"."status" = ? ' +
            'AND "Voices"."deleted" = ? ' +
            'GROUP BY "org_id" ' +
            'ORDER BY "voices_count" DESC, "members_count" DESC', ['organization', false, Voice.STATUS_PUBLISHED, false])
            .asCallback(function (err, result) {
              if (err) { return done(err); }

              var orgIds = result.rows.map(function (org) { return org.org_id; });

              Entity.whereIn('id', orgIds, function (err, orgs) {
                EntitiesPresenter.build(orgs, req.currentPerson, function(err, organizations) {
                  if (err) { return done(err); }

                  res.locals.mostActiveOrganizations = organizations;

                  done();
                });
              });
            });
        */
        }, function(done) {
          var ids,
            entities;

          async.series([
            function (nextSeries) {
              FeaturedPerson.all(function (err, featuredPeople) {
                if (err) { return nextSeries(err); }

                ids = featuredPeople.map(function (f) { return f.entityId; });

                return nextSeries();
              });
            },

            function (nextSeries) {
              FeaturedOrganization.all(function (err, featuredOrganizations) {
                if (err) { return nextSeries(err); }

                ids = ids.concat(featuredOrganizations.map(function (f) { return f.entityId; }));

                return nextSeries();
              });
            },

            function (nextSeries) {
              Entity.whereIn('id', ids, function (err, result) {
                if (err) { return nextSeries(err); }

                entities = result;

                return nextSeries();
              });
            },
          ], function (err) {
            if (err) { return done(err); }

            EntitiesPresenter.build(entities, req.currentPerson, function (err, result) {
              if (err) { return done(err); }

              res.locals.mostActiveOrganizations = result;

              return done();
            });
          });
        }, function(done) {
          HomepageTopVoice.find({ active: true }, function (err, topVoices) {
            if (err) { return done(err); }

            if (topVoices.length < 1) {
              res.locals.topVoice = null;
              return done();
            }

            var topVoice = new HomepageTopVoice(topVoices[0]);

            delete topVoice.id;
            delete topVoice.voiceId;

            res.locals.topVoice = topVoice;

            Voice.find({ id: topVoices[0].voiceId }, function (err, voice) {
              if (err) { return done(err); }

              VoicesPresenter.build(voice, req.currentPerson, function (err, presented) {
                if (err) { return done(err); }

                res.locals.topVoice.voice = presented[0];

                return done();
              });
            });
          });
        }], function(err) {
          if (err) { return next(err); }

          res.format({
            html: function () {
              res.render('home/index', {
                layout : 'application',
                pageName : 'page-home'
              });
            },

            json: function () {
              res.json({ status: 'ok', featuredEntities: res.locals.mostActiveOrganizations });
            }
          });
        });
      });

    },

    signupIsProfileNameAvailable : function(req, res, next) {
      isProfileNameAvailable(req.body.profileName, function (err, result) {
        if (err) { return next(err); }

        if (result) {
          return res.json({ status: 'available' });
        } else {
          return res.json({ status: 'taken' });
        }
      });
    }
  }
});

module.exports = new HomeController();
