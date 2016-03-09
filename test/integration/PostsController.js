'use strict'

var application = require('neonode-core')
require(path.join(__dirname, '../../lib/routes.js'))

global.FeedInjector = require(path.join(__dirname, '../../lib/FeedInjector.js'))
require(path.join(__dirname, '../../presenters/PostsPresenter'))

application._serverStart()

// COMMENT IF YOU WANT LOGGER OUTPUT
logger.info = function () {}

var login = require(path.join(__dirname, 'login.js')),
  expect = require('chai').expect,
  request = require('superagent')

CONFIG.database.logQueries = false

var urlBase = 'http://localhost:3000'

// MONKEY PATCH
// This is in order to fix the issue where if you provide an updatedAt property
// the updatedAt property will be set to what you provided, thus causing
// problems.
Argon.Storage.Knex.prototype.update = function update(requestObj, callback) {
  var storage = this;

  callback = callback || function defaultPutCallBack() {
    throw new Error('callback is undefined');
  };

  if ((typeof requestObj) === 'undefined' || requestObj === null) {
    return callback('requestObj is undefined');
  }

  if (requestObj.data) {
    for (i = 0; i < storage.preprocessors.length; i++) {
      requestObj.data = storage.preprocessors[i](requestObj.data, requestObj);
    }
  }

  var date = new Date(Date.now());

  this.updatedAt = date;
  requestObj.data.updated_at = date;

  this.queries.update(requestObj, function(err, data) {
    for (i = 0; i < storage.processors.length; i++) {
      data = storage.processors[i](data, requestObj);
    }

    return callback(err, data);
  });
};

describe('PostsController', function () {

  describe('#update', function () {

    it('Should change updated_at of Voice when post is published', function (doneTest) {
      async.series([
        // Jon Snow create unapproved post
        function (nextSeries) {
          login('jon-snow', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/cersei-lannister/walk-of-atonement')
              .accept('application/json')
              .send({
                _csrf: csrf,
                posts: [
                  {
                    title: 'Mirage A Smoke',
                    description: 'French Uncomfortable Jenny',
                    publishedAt: 'Thu Oct 15 2015 12:20:00 GMT-0500 (CDT)',
                    image: '',
                    imageWidth: '0',
                    imageHeight: '0',
                    sourceType: 'link',
                    sourceService: 'link',
                    sourceUrl: 'http://gfycat.com/FrenchUncomfortableJenny',
                    imagePath: '',
                  },
                ],
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        // Cersei approve Jon's post
        function (nextSeries) {
          login('cersei-lannister', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .put(urlBase + '/cersei-lannister/walk-of-atonement/' + hashids.encode(1))
              .accept('application/json')
              .send({
                _csrf: csrf,
                title: 'CSGO Mirage Smoke T spawn to Connector Jungle - Gfycat',
                description: 'new mirage smoke from t spawn to a site',
                publishedAt: 'Thu Nov 19 2015 11:43:00 GMT-0600 (CST)',
                image: null,
                imageWidth: 0,
                imageHeight: 0,
                sourceType: 'link',
                sourceService: 'link',
                sourceUrl: 'http://gfycat.com/FrenchUncomfortableJenny',
                imagePath: '/uploads/development/post_' + hashids.encode(1) + '/image_medium.jpeg',
                approved: true,
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        function (nextSeries) {
          setTimeout(nextSeries, 2000)
        },
      ], function (err) {
        if (err) { return doneTest(err) }

        Voice.findById(6, function (err, voice) {
          if (err) { return doneTest(err) }

          expect(new Date(voice[0].createdAt)).to.not.eql(new Date(voice[0].updatedAt))

          return doneTest()
        })
      })
    })

    it('Should save image properly when post is being updated with new image', function (doneTest) {
      var imageInfo

      async.series([
        function (nextSeries) {
          login('jon-snow', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/tyrion-lannister/blackwater-battle/saveArticle')
              .accept('application/json')
              .send({
                _csrf: csrf,
                title: 'This will go to moderation.',
                content: 'This will eventually have an image...',
                publishedAt: new Date(),
              })
              .end(nextSeries)
          })
        },

        function (nextSeries) {
          login('tyrion-lannister', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/tyrion-lannister/blackwater-battle/uploadPostImage')
              .attach('image', path.join(process.cwd(), 'public/generator/users/tyrion.jpg'))
              .field('_csrf', csrf)
              .end(function (err, res) {
                if (err) { console.log(err); return nextSeries(err) }

                expect(res.status).to.equal(200)

                imageInfo = res.body

                return nextSeries()
              })
          })
        },

        function (nextSeries) {
          login('tyrion-lannister', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .put(urlBase + '/tyrion-lannister/blackwater-battle/' + hashids.encode(2))
              .send({
                _csrf: csrf,
                title: 'This will go to moderation',
                description: 'This will eventually have an image...',
                publishedAt: 'Thu Nov 19 2015 11:43:00 GMT-0600 (CST)',
                image: '',
                imageWidth: imageInfo.width,
                imageHeight: imageInfo.height,
                sourceType: 'text',
                sourceService: 'local',
                sourceUrl: '',
                images: [ imageInfo.path ],
                imagePath: imageInfo.path,
                approved: true,
              })
              .end(function (err, res) {
                if (err) { console.log(err); return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },
      ], function (err) {
        if (err) { return doneTest(err) }

        Post.find({ title: 'This will go to moderation' }, function (err, post) {
          if (err) { return doneTest(err) }

          expect(post.length).to.equal(1)

          expect(post[0].imageBaseUrl).to.not.be.empty
          expect(post[0].imageMeta).to.not.be.empty

          return doneTest()
        })
      })
    })

  })

  describe('#saveArticle', function () {

    it('Should create post with no errors', function (doneTest) {
      login('jon-snow', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/jon-snow/white-walkers/saveArticle')
          .accept('application/json')
          .send({
            _csrf: csrf,
            title: 'Test article being saved.',
            content: 'THIS IS THE VERY INSIGHTFUL CONTENT OF THIS POST ABOUT THE WHITE WALKERS.',
            publishedAt: new Date(),
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            Post.find({
              title: 'Test article being saved.',
            }, function (err, post) {
              if (err) { return doneTest(err) }

              expect(post[0].title).to.equal('Test article being saved.')
              expect(post[0].sourceType).to.equal(Post.SOURCE_TYPE_TEXT)

              return doneTest()
            })
          })
      })
    })

    it('Should insta-publish article if Voice owner', function (doneTest) {
      login('jon-snow', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/jon-snow/battle-of-castle-black/saveArticle')
          .accept('application/json')
          .send({
            _csrf: csrf,
            title: 'Insta-publish because owner test',
            content: 'THIS IS THE VERY INSIGHTFUL CONTENT OF THIS POST ABOUT THE WALK OF ATONEMENT.',
            publishedAt: new Date(),
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            Post.find({
              title: 'Insta-publish because owner test',
            }, function (err, post) {
              if (err) { return doneTest(err) }

              expect(post[0].approved).to.equal(true)

              return doneTest()
            })
          })
      })
    })

    it('Should not give 403 when publishing on Org\'s Closed Voice', function (doneTest) {
      db('Voices')
        .update('type', Voice.TYPE_CLOSED)
        .where('owner_id', '=', 24)
        .asCallback(function (err) {
          if (err) { return doneTest(err) }

          login('robert-baratheon', function (err, agent, csrf) {
            if (err) { return doneTest(err) }

            agent
              .post(urlBase + '/house-baratheon/kings-landing/saveArticle')
              .accept('application/json')
              .send({
                _csrf: csrf,
                title: 'THIS CAN BE PUBLISHED BY ORG OWNER, SHOULD NOT GIVE 403',
                content: 'THIS IS THE VERY INSIGHTFUL CONTENT OF THIS POST ABOUT THE WALK OF ATONEMENT.',
                publishedAt: new Date(),
              })
              .end(function (err, res) {
                if (err) { console.log('!!!!!!!'); console.log(err); return doneTest(err) }

                expect(res.status).to.equal(200)

                Post.find({
                  title: 'THIS CAN BE PUBLISHED BY ORG OWNER, SHOULD NOT GIVE 403',
                }, function (err, post) {
                  if (err) { return doneTest(err) }

                  expect(post[0].approved).to.equal(true)

                  return doneTest()
                })
              })
          })
        })
    })

  })

  describe('#create', function () {

    it('Should create post with no errors as non-admin', function (done) {
      login('jon-snow', function (err, agent, csrf) {
        if (err) { return done(err) }

        agent
          .post(urlBase + '/jon-snow/white-walkers')
          .accept('application/json')
          .send({
            _csrf: csrf,
            posts: [
              {
                title: 'Archives - Blog - Greduan.com',
                description: 'A great website.',
                publishedAt: 'Thu Oct 15 2015 12:20:00 GMT-0500 (CDT)',
                image: '',
                imageWidth: '0',
                imageHeight: '0',
                sourceType: 'link',
                sourceService: 'link',
                sourceUrl: 'http://blog.greduan.com',
                imagePath: '',
              },
            ],
          })
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)

            Post.find({ source_url: 'http://blog.greduan.com' }, function (err, post) {
              if (err) { return done(err) }

              expect(post.length).to.equal(1)
              expect(post[0].title).to.equal('Archives - Blog - Greduan.com')

              return done()
            })
          })
      })
    })

    it('Should create post with no errors in public voice as non-owner', function (done) {
      login('arya-stark', function (err, agent, csrf) {
        if (err) { return done(err) }

        agent
          .post(urlBase + '/jon-snow/white-walkers')
          .accept('application/json')
          .send({
            _csrf: csrf,
            posts: [
              {
                title: 'Greduan.com',
                description: 'A great website.',
                publishedAt: 'Thu Oct 15 2015 12:20:00 GMT-0500 (CDT)',
                image: '',
                imageWidth: '0',
                imageHeight: '0',
                sourceType: 'link',
                sourceService: 'link',
                sourceUrl: 'http://greduan.com',
                imagePath: '',
              },
            ],
          })
          .end(function (err, res) {
            if (err) { return done(err) }

            expect(res.status).to.equal(200)

            Post.find({ source_url: 'http://greduan.com' }, function (err, post) {
              if (err) { return done(err) }

              expect(post.length).to.equal(1)
              expect(post[0].title).to.equal('Greduan.com')

              return done()
            })
          })
      })
    })

    it('Should change updated_at of Voice when post is insta-published', function (doneTest) {
      async.series([
        // Jon Snow create unapproved post
        function (nextSeries) {
          login('cersei-lannister', function (err, agent, csrf) {
            if (err) { return nextSeries(err) }

            agent
              .post(urlBase + '/cersei-lannister/walk-of-atonement')
              .accept('application/json')
              .send({
                _csrf: csrf,
                posts: [
                  {
                    title: 'A post about colors by master z3bra',
                    description: 'French Uncomfortable Hacker',
                    publishedAt: 'Thu Oct 15 2015 12:20:00 GMT-0500 (CDT)',
                    image: '',
                    imageWidth: '0',
                    imageHeight: '0',
                    sourceType: 'link',
                    sourceService: 'link',
                    sourceUrl: 'http://blog.z3bra.org/2015/06/vomiting-colors.html',
                    imagePath: '',
                  },
                ],
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          })
        },

        function (nextSeries) {
          setTimeout(nextSeries, 2000)
        },
      ], function (err) {
        if (err) { return doneTest(err) }

        Voice.findById(6, function (err, voice) {
          if (err) { return doneTest(err) }

          expect(new Date(voice[0].createdAt)).to.not.eql(new Date(voice[0].updatedAt))

          return doneTest()
        })
      })
    })

    it('Should not crash when favicon does not return a content-type header', function (doneTest) {
      login('jon-snow', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/jon-snow/white-walkers')
          .accept('application/json')
          .send({
            _csrf: csrf,
            posts: [
              {
                title: 'Bangladesh can now send male workers to Saudi Arabia: Secretary -',
                description: 'WHAT EVER',
                publishedAt: 'Thu Oct 15 2015 12:20:00 GMT-0500 (CDT)',
                image: '',
                imageWidth: '0',
                imageHeight: '0',
                sourceType: 'link',
                sourceService: 'link',
                sourceUrl: 'http://bdnews24.com/economy/2016/01/04/bangladesh-can-now-send-male-workers-to-saudi-arabia-secretary',
                imagePath: '',
              },
            ],
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            Post.find({ source_url: 'http://bdnews24.com/economy/2016/01/04/bangladesh-can-now-send-male-workers-to-saudi-arabia-secretary' }, function (err, post) {
              if (err) { return doneTest(err) }

              expect(post.length).to.equal(1)

              return doneTest()
            })
          })
      })
    })

    it('Should not return 403 on Closed Voice when Voice owner', function (doneTest) {
      login('tyrion-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/tyrion-lannister/war-of-the-5-kings')
          .accept('application/json')
          .send({
            _csrf: csrf,
            posts: [
              {
                title: 'Test for 403 when Voice owner but Voice closed',
                description: 'WHAT EVER',
                publishedAt: 'Thu Oct 15 2015 12:20:00 GMT-0500 (CDT)',
                image: '',
                imageWidth: '0',
                imageHeight: '0',
                sourceType: 'link',
                sourceService: 'link',
                sourceUrl: 'https://github.com/mhinz',
                imagePath: '',
              },
            ],
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            Post.find({
              title: 'Test for 403 when Voice owner but Voice closed',
            }, function (err, post) {
              if (err) { return doneTest(err) }

              expect(post[0].approved).to.equal(true)

              return doneTest()
            })
          })
      })
    })

  })

  describe('#preview', function () {

    it('From URL: Invalid YouTube URL should not crash server', function (done) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return done(err) }

        agent
          .post(urlBase + '/cersei-lannister/dead-of-arryn/preview')
          .accept('application/json')
          .send({
            _csrf: csrf,
            url: 'https://www.youtube.com/watch?v=M4Txn4FtV4', // missing an "o" at end
          })
          .end(function (err, res) {
            expect(res.status).to.equal(400)
            //expect(res.body.status).to.equal('There was an error in the request')

            ScrapperError.find({
              url: 'https://www.youtube.com/watch?v=M4Txn4FtV4',
            }, function (err, result) {
              if (err) { return done(err) }

              expect(result.length).to.equal(1)

              return done()
            })
          })
      })
    })

    it('Should log scrappers\' errors', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/cersei-lannister/dead-of-arryn/preview')
          .accept('application/json')
          .send({
            _csrf: csrf,
            url: 'htt://blog.greduan.com', // missing a "p" at http
          })
          .end(function (err, res) {
            expect(res.status).to.equal(400)
            //expect(res.body.status).to.be.an('Bad URL')

            ScrapperError.find({
              url: 'htt://blog.greduan.com',
            }, function (err, result) {
              if (err) { return doneTest(err) }

              expect(result.length).to.equal(1)

              return doneTest()
            })
          })
      })
    })

  })

  describe('#show', function () {

    // Requires data_generator to have generated 0 posts
    it('Should create ReadablePost record, with data not null', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        var postId

        async.series([
          function (nextSeries) {
            agent
              .post(urlBase + '/cersei-lannister/walk-of-atonement/')
              .accept('application/json')
              .send({
                _csrf: csrf,
                posts: [
                  {
                    title: 'My switch to OpenBSD, first impressions - Blog - Greduan.com',
                    description: 'A story talking about my switch to OpenBSD.',
                    publishedAt: 'Thu Oct 15 2015 12:20:00 GMT-0500 (CDT)',
                    image: '',
                    imageWidth: '0',
                    imageHeight: '0',
                    sourceType: 'link',
                    sourceService: 'link',
                    sourceUrl: 'http://blog.greduan.com/2015-04-19-mstobfi.html',
                    imagePath: '',
                  },
                ],
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                Post.find({ source_url: 'http://blog.greduan.com/2015-04-19-mstobfi.html' }, function (err, post) {
                  if (err) { return nextSeries(err) }

                  expect(post.length).to.equal(1)
                  postId = post[0].id

                  return nextSeries()
                })
              })
          },

          function (nextSeries) {
            request
              .get(urlBase + '/cersei-lannister/walk-of-atonement/' + hashids.encode(postId))
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          },
        ], function (err) {
          if (err) { return doneTest(err) }

          ReadablePost.find({
            post_id: postId
          }, function (err, post) {
            if (err) { return doneTest(post) }

            expect(post.length).to.equal(1)
            expect(post[0].data).to.not.equal(null)
            expect(post[0].readerable).to.exist

            return doneTest()
          })
        })
      })
    })

    it('Should create ReadablePost record, with data null', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        var postId

        async.series([
          function (nextSeries) {
            agent
              .post(urlBase + '/cersei-lannister/walk-of-atonement/')
              .accept('application/json')
              .send({
                _csrf: csrf,
                posts: [
                  {
                    title: 'SecuriTay on Twitter - booop boop',
                    description: 'A tweet',
                    publishedAt: 'Thu Oct 15 2015 12:20:00 GMT-0500 (CDT)',
                    image: '',
                    imageWidth: '0',
                    imageHeight: '0',
                    sourceType: 'link',
                    sourceService: 'link',
                    sourceUrl: 'https://twitter.com/SwiftOnSecurity/status/671553990203588609',
                    imagePath: '',
                  },
                ],
              })
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                Post.find({ source_url: 'https://twitter.com/SwiftOnSecurity/status/671553990203588609' }, function (err, post) {
                  if (err) { return nextSeries(err) }

                  expect(post.length).to.equal(1)
                  postId = post[0].id

                  return nextSeries()
                })
              })
          },

          function (nextSeries) {
            request
              .get(urlBase + '/cersei-lannister/walk-of-atonement/' + hashids.encode(postId))
              .end(function (err, res) {
                if (err) { return nextSeries(err) }

                expect(res.status).to.equal(200)

                return nextSeries()
              })
          },
        ], function (err) {
          if (err) { return doneTest(err) }

          ReadablePost.find({
            post_id: postId
          }, function (err, post) {
            if (err) { return doneTest(post) }

            expect(post.length).to.equal(1)
            expect(post[0].data).to.equal(null)
            expect(post[0].readerable).to.exist

            return doneTest()
          })
        })
      })
    })

  })

})
