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

describe('OrganizationsController', function () {

  describe('#requestMembership', function () {

    it('Should request membership with no errors', function (doneTest) {
      login('jon-snow', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/house-targaryen/requestMembership')
          .accept('application/json')
          .send({
            _csrf: csrf,
            orgId: hashids.encode(23), // House Targaryen
            message: '8554773235'
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            FeedAction.find({
              item_type: 'entity',
              item_id: 23,
              action: 'requested to become a member',
              who: 9,
            }, function (err, result) {
              if (err) { return doneTest(err) }

              expect(result.length).to.equal(1)

              Notification.find({
                action_id: result[0].id,
                follower_id: 7,
              }, function (err, result) {
                if (err) { return doneTest(err) }

                expect(result.length).to.equal(1)

                expect(result[0].read).to.equal(false)
                expect(result[0].forFeed).to.equal(false)

                return doneTest()
              })
            })
          })
      })
    })

  })

  describe('#create', function () {

    it('Should create notification settings for organization', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/cersei-lannister/newOrganization')
          .type('form')
          .accept('application/json')
          .send({
            _csrf: csrf,
            title: 'House Lannister of them all',
            profileName: 'house-lannister-2',
            description: 'The alternative to the House Lannister, in case you don\'t like the main line.',
            locationName: '',
            imageLogo: undefined,
            imageBackground: undefined,
          })
          .end(function (err, res) {
            if (err) { return doneTest(err) }

            expect(res.status).to.equal(200)

            NotificationSetting.find({ entity_id: 25 }, function (err, result) {
              if (err) { return doneTest(err) }

              expect(result.length).to.equal(1)

              return doneTest()
            })
          })
      })
    })

    it('Should not allow you to create org with same profile name as currentPerson', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/cersei-lannister/newOrganization')
          .type('form')
          .accept('application/json')
          .send({
            _csrf: csrf,
            title: 'Valve',
            profileName: 'cersei-lannister',
            description: 'Creator of games such as Portal, TF2 or CS and creators of the Steam platform.',
            locationName: '',
            imageLogo: undefined,
            imageBackground: undefined,
          })
          .end(function (err, res) {
            expect(err).to.exist
            expect(res.status).to.equal(403)

            return doneTest()
          })
      })
    })

    it('Should not allow you to create org with profile name in BlackListFilter', function (doneTest) {
      login('cersei-lannister', function (err, agent, csrf) {
        if (err) { return doneTest(err) }

        agent
          .post(urlBase + '/cersei-lannister/newOrganization')
          .type('form')
          .accept('application/json')
          .send({
            _csrf: csrf,
            title: 'BlackList Organization',
            profileName: 'search',
            description: 'The true organization, the one in the blacklist for naughtiness.',
            locationName: '',
            imageLogo: undefined,
            imageBackground: undefined,
          })
          .end(function (err, res) {
            expect(err).to.exist
            expect(res.status).to.equal(403)

            return doneTest()
          })
      })
    })

    it('Should allow you to create organization when in Anonymous mode', function (doneTest) {
      login('jon-snow', function (err, agent, csrf) {
        if (err) { return testDone(err) }

        async.series([
          function (seriesNext) {
            agent
              .get(urlBase + '/switchPerson')
              .end(function (err, res) {
                if (err) { return seriesNext(err) }

                expect(res.status).to.equal(200)

                return seriesNext()
              })
          },

          function (seriesNext) {
            agent
              .post(urlBase + '/jon-snow/newOrganization')
              .type('form')
              .accept('application/json')
              .send({
                _csrf: csrf,
                title: 'Anon test org',
                profileName: 'anon-test-org',
                description: 'The true organization, the one in the blacklist for naughtiness.',
                locationName: '',
                imageLogo: undefined,
                imageBackground: undefined,
              })
              .end(function (err, res) {
                if (err) { return seriesNext(err) }

                expect(res.status).to.equal(200)

                Entity.find({ profile_name: 'anon-test-org' }, function (err, entity) {
                  if (err) { return seriesNext(err) }

                  expect(entity.length).to.be.above(0)

                  EntityOwner.find({ owned_id: entity[0].id }, function (err, owner) {
                    if (err) { return seriesNext(err) }

                    expect(owner.length).to.be.above(0)
                    expect(owner[0].ownerId).to.equal(9)

                    return seriesNext()
                  })
                })
              })
          },
        ], doneTest)
      })
    })

  })

  describe('#members', function () {

    it('Should not crash server and return 200', function (doneTest) {
      request
        .get(urlBase + '/house-lannister/members')
        .end(function (err, res) {
          if (err) { return doneTest(err) }

          expect(res.status).to.equal(200)

          return doneTest()
        })
    })

  })

})
