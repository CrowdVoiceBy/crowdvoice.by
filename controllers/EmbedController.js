var EmbedController = Class('EmbedController')({
  prototype : {
    voice : function voice (req, res, next) {
      ACL.isAllowed('show', 'voices', req.role, {
        currentPerson: req.currentPerson,
        voice: req.activeVoice,
        profileName: req.params.profileName
      }, function (err, result) {
        if (err) { return next(err); }

        if (!result.isAllowed) {
          return next(new ForbiddenError());
        }

        Voice.findBySlug(req.params.voice_slug, function (err, voice) {
          if (err) { return next(err); }

          var settings = {
            theme: 'dark',
            accent: 'FF9400',
            default_view: 'cards',
            change_view: (req.query.change_view === 'true'),
            description: (req.query.description === 'true'),
            background: (req.query.background === 'true'),
            share: (req.query.share === 'true')
          };
          var dates = { firstPostDate: null, lastPostDate: null };
          var counts = {};

          if (req.query.theme && req.query.theme.match(/^(dark|light)$/)) {
            settings.theme = req.query.theme;
          }

          if (/^(#)?([0-9a-fA-F]{3})([0-9a-fA-F]{3})?$/.test(req.query.accent)) {
            settings.accent = req.query.accent;
          }

          if (req.query.default_view && req.query.default_view.match(/^(cards|list)$/)) {
            settings.default_view = req.query.default_view;
          }

          async.parallel([
            function (done) {
              db.raw("SELECT COUNT (*), \
                to_char(\"Posts\".published_at, 'MM') AS MONTH, \
                to_char(\"Posts\".published_at, 'YYYY') AS YEAR \
                FROM \"Posts\" \
                WHERE \"Posts\".voice_id = ? \
                AND \"Posts\".approved = true \
                GROUP BY MONTH, YEAR \
                ORDER BY YEAR DESC, MONTH DESC", [voice.id])
              .asCallback(function (err, postsCount) {
                if (err) { return done(err); }

                postsCount.rows.forEach(function (post) {
                  if (!counts[post.year]) { counts[post.year] = {}; }
                  counts[post.year][post.month] = post.count;
                });
                done();
              });
            },

            function (done) {
              db('Posts').where({ 'voice_id': voice.id, approved: true })
              .orderBy('published_at', 'ASC').limit(1)
              .asCallback(function (err, firstPost) {
                if (err) { return done(err); }

                if (firstPost.length) { dates.firstPostDate = firstPost[0].published_at; }
                done();
              });
            },

            function (done) {
              db('Posts').where({ 'voice_id': voice.id, approved : true })
                .orderBy('published_at', 'DESC').limit(1)
                .asCallback(function (err, lastPost) {
                  if (err) { return done(err); }

                  if (lastPost.length) { dates.lastPostDate = lastPost[0].published_at; }
                  done();
                });
            }
          ], function (err) {
            if (err) { return next(err); }

            VoicesPresenter.build([voice], req.currentPerson, function (err, voices) {
              if (err) { return next(err); }

              res.locals.params = settings;
              res.locals.voice = new Voice(voices[0]);
              res.locals.firstPostDate = dates.firstPostDate;
              res.locals.lastPostDate = dates.lastPostDate;
              res.locals.postsCount = counts;

              res.format({
                html : function () {
                  res.render('embed/show.html', { layout : 'embed' });
                }
              });
            });
          });
        });
      });
    }
  }
});

module.exports = new EmbedController();
