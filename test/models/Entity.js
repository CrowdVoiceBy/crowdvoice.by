'use strict'

var path = require('path')

require(path.join(process.cwd(), 'bin', 'server.js'))

logger.info = function () {}

var expect = require('chai').expect

var constructorLoop = function (array, className) {
  array.forEach(function (a) {
    expect(a.constructor.className).to.equal(className)
  })
}

var propertyLoop = function (array, propertyName, value) {
  array.forEach(function (a) {
    expect(a[propertyName]).to.equal(value)
  })
}

describe('K.Entity', function () {

  describe('Relations', function () {

    describe('user', function () {

      it('Should return a proper User object', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('user')
          .then(function (result) {
            var tyrion = result[0]

            expect(tyrion.user).to.be.an('object')
            expect(tyrion.user.constructor.className).to.equal('User')
            expect(tyrion.user.entityId).to.equal(1)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('anonymousEntity', function () {

      it('Should return an array with the Anonymous Entity', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('anonymousEntity')
          .then(function (result) {
            var tyrion = result[0]

            expect(tyrion.anonymousEntity).to.be.an('array')
            expect(tyrion.anonymousEntity.length).to.equal(1)
            expect(tyrion.anonymousEntity[0]).to.be.an('object')
            expect(tyrion.anonymousEntity[0].constructor.className).to.equal('Entity')
            expect(tyrion.anonymousEntity[0].id).to.equal(2)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('voices', function () {

      it('Should return an array with proper Voices', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('voices')
          .then(function (result) {
            var tyrion = result[0]

            expect(tyrion.voices).to.be.an('array')
            expect(tyrion.voices.length).to.equal(4)
            constructorLoop(tyrion.voices, 'Voice')
            propertyLoop(tyrion.voices, 'ownerId', 1)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('listableVoices', function () {

      it('Should return an array with proper Voices', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('listableVoices')
          .then(function (result) {
            var tyrion = result[0]

            expect(tyrion.listableVoices).to.be.an('array')
            expect(tyrion.listableVoices.length).to.equal(2)
            constructorLoop(tyrion.listableVoices, 'Voice')
            propertyLoop(tyrion.listableVoices, 'ownerId', 1)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('viewableVoices', function () {

      it('Should return an array with proper Voices', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('viewableVoices')
          .then(function (result) {
            var tyrion = result[0]

            expect(tyrion.viewableVoices).to.be.an('array')
            expect(tyrion.viewableVoices.length).to.equal(3)
            constructorLoop(tyrion.viewableVoices, 'Voice')
            propertyLoop(tyrion.viewableVoices, 'ownerId', 1)

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('organizations', function () {

      it('Should return an empty array for Tyrion', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('organizations')
          .then(function (result) {
            var tyrion = result[0]

            expect(tyrion.organizations).to.be.an('array')
            expect(tyrion.organizations.length).to.equal(0)

            return doneTest()
          })
          .catch(doneTest)
      })

      it('Should return an array with proper Organizations for Cersei', function (doneTest) {
        K.Entity.query()
          .where('id', 3)
          .include('organizations')
          .then(function (result) {
            var cersei = result[0]

            expect(cersei.organizations).to.be.an('array')
            expect(cersei.organizations.length).to.equal(1)
            constructorLoop(cersei.organizations, 'Entity')
            propertyLoop(cersei.organizations, 'type', 'organization')
            expect(cersei.organizations[0].name).to.equal('House Lannister')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('contributedVoices', function () {

      it('Should return an empty array for Tyrion', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('contributedVoices')
          .then(function (result) {
            var tyrion = result[0]

            expect(tyrion.contributedVoices).to.be.an('array')
            expect(tyrion.contributedVoices.length).to.equal(0)

            return doneTest()
          })
          .catch(doneTest)
      })

      it('Should return an array with proper Voices for Jaime', function (doneTest) {
        K.Entity.query()
          .where('id', 5)
          .include('contributedVoices')
          .then(function (result) {
            var jaime = result[0]

            expect(jaime.contributedVoices).to.be.an('array')
            expect(jaime.contributedVoices.length).to.equal(1)
            constructorLoop(jaime.contributedVoices, 'Voice')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('memberOrganizations', function () {

      it('Should return an array with proper Organizations', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('memberOrganizations')
          .then(function (result) {
            var tyrion = result[0]

            expect(tyrion.memberOrganizations).to.be.an('array')
            expect(tyrion.memberOrganizations.length).to.equal(1)
            constructorLoop(tyrion.memberOrganizations, 'Entity')
            propertyLoop(tyrion.memberOrganizations, 'type', 'organization')
            expect(tyrion.memberOrganizations[0].name).to.equal('House Lannister')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('followedVoices', function () {

      it('Should return an array with proper Voices', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('followedVoices')
          .then(function (result) {
            var tyrion = result[0]

            expect(tyrion.followedVoices).to.be.an('array')
            expect(tyrion.followedVoices.length).to.equal(10)
            constructorLoop(tyrion.followedVoices, 'Voice')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

    describe('followedEntities', function () {

      it('Should return an array with proper Entities', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('followedEntities')
          .then(function (result) {
            var tyrion = result[0]

            expect(tyrion.followedEntities).to.be.an('array')
            expect(tyrion.followedEntities.length).to.equal(3)
            constructorLoop(tyrion.followedEntities, 'Entity')

            return doneTest()
          })
          .catch(doneTest)
      })

    })

  })

  describe('#getAnonymousEntity', function () {

    it('Should return an Anonymous Entity for Tyrion', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (result) {
          var tyrion = result[0]

          tyrion.getAnonymousEntity()
            .then(function (anonEnt) {
              expect(anonEnt).to.be.an('object')
              expect(anonEnt.constructor.className).to.equal('Entity')
              expect(anonEnt.isAnonymous).to.equal(true)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

    it('Should throw error for Anonymous Entity', function (doneTest) {
      K.Entity.query()
        .where('id', 2)
        .then(function (result) {
          var tyrion = result[0]

          tyrion.getAnonymousEntity()
            .then(function (result) {
              throw new Error('Shouldn\'t resolve')
            })
            .catch(function (err) {
              expect(err).to.be.an('error')

              return doneTest()
            })
        })
    })

  })

  describe('#getOwner', function () {

    it('Should return Anonymous Entity\'s owner Entity', function (doneTest) {
      K.Entity.query()
        .where('id', 2)
        .then(function (result) {
          var anon = result[0]

          anon.getOwner()
            .then(function (entity) {
              expect(entity).to.be.an('object')
              expect(entity.constructor.className).to.equal('Entity')
              expect(entity.isAnonymous).to.equal(false)
              expect(entity.id).to.equal(1)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

    it('Should return Organization Entity\'s owner Entity', function (doneTest) {
      K.Entity.query()
        .where('id', 22)
        .then(function (result) {
          var org = result[0]

          org.getOwner()
            .then(function (entity) {
              expect(entity).to.be.an('object')
              expect(entity.constructor.className).to.equal('Entity')
              expect(entity.isAnonymous).to.equal(false)
              expect(entity.id).to.equal(3)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

    it('Should throw if K.Entity is type = \'person\' AND isAnonymous = false', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (result) {
          var tyrion = result[0]

          tyrion.getOwner()
            .then(function (entity) {
              throw new Error('Shouldn\'t resolve')
            })
            .catch(function (err) {
              expect(err).to.be.an('error')

              return doneTest()
            })
        })
    })

  })

  describe('#getRealEntity', function () {

    it('Should work the same as #getOwner for Anonymous Entities', function (doneTest) {
      K.Entity.query()
        .where('id', 2)
        .then(function (result) {
          var anon = result[0]

          anon.getOwner()
            .then(function (entity) {
              expect(entity).to.be.an('object')
              expect(entity.constructor.className).to.equal('Entity')
              expect(entity.isAnonymous).to.equal(false)
              expect(entity.id).to.equal(1)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

    it('Should throw for non-Anonymous Entities', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (result) {
          var tyrion = result[0]

          tyrion.getOwner()
            .then(function (entity) {
              throw new Error('Shouldn\'t resolve')
            })
            .catch(function (err) {
              expect(err).to.be.an('error')

              return doneTest()
            })
        })
    })

  })

  describe('#isOwnerOfEntity', function () {

    it('Should return true for Cersei owner of House Lannister', function (doneTest) {
      K.Entity.query()
        .where('id', 3)
        .then(function (result) {
          var cersei = result[0]

          cersei.isOwnerOfEntity(new K.Entity({ id: 22 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(true)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

    it('Should return false for Tyrion owner of House Lannister', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (result) {
          var tyrion = result[0]

          tyrion.isOwnerOfEntity(new K.Entity({ id: 22 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(false)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

    it('Should return true for ownership of Anonymous Entity', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (result) {
          var tyrion = result[0]

          tyrion.isOwnerOfEntity(new K.Entity({ id: 2 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(true)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

  })

  describe('#isOwnedBy', function () {

    it('Should return true for House Lannister owned by Cersei', function (doneTest) {
      K.Entity.query()
        .where('id', 22)
        .then(function (result) {
          var org = result[0]

          org.isOwnedBy(new K.Entity({ id: 3 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(true)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

    it('Should return false for House Lannister owned by Tyrion', function (doneTest) {
      K.Entity.query()
        .where('id', 22)
        .then(function (result) {
          var org = result[0]

          org.isOwnedBy(new K.Entity({ id: 1 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(false)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

    it('Should return true for Anonymous Entity ownership', function (doneTest) {
      K.Entity.query()
        .where('id', 2)
        .then(function (result) {
          var anonEnt = result[0]

          anonEnt.isOwnedBy(new K.Entity({ id: 1 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(true)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

  })

  describe('#isOwnerOfVoice', function () {

    it('Should return true for Tyrion owner of Valyrian Roads', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (result) {
          var tyrion = result[0]

          tyrion.isOwnerOfVoice(new K.Voice({ id: 4 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(true)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

    it('Should return false for Cersei owner of Valyrian Roads', function (doneTest) {
      K.Entity.query()
        .where('id', 3)
        .then(function (result) {
          var cersei = result[0]

          cersei.isOwnerOfVoice(new K.Voice({ id: 4 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(false)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

  })

  describe('#hasAccessToVoice', function () {

    it('Should throw an error when no Voice relations are found', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (result) {
          var tyrion = result[0]

          tyrion.hasAccessToVoice(new K.Voice({ id: 1 }))
            .then(function (result) {
              throw new Error('Shouldn\'t resolve')
            })
            .catch(function (err) {
              expect(err).to.be.an('error')

              return doneTest()
            })
        })
    })

    describe('Owned voices', function () {

      it('Should return true for Tyrion having access to Valyrian Roads', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('voices')
          .then(function (result) {
            var tyrion = result[0]

            tyrion.hasAccessToVoice(new K.Voice({ id: 4 }))
              .then(function (result) {
                expect(result).to.be.a('boolean')
                expect(result).to.equal(true)

                return doneTest()
              })
              .catch(doneTest)
          })
      })

      it('Should return true for Tyrion having access to Second Trial by Combat (anonymous owner)', function (doneTest) {
        K.Entity.query()
          .where('id', 1)
          .include('anonymousEntity.voices')
          .then(function (result) {
            var tyrion = result[0]

            tyrion.hasAccessToVoice(new K.Voice({ id: 2 }))
              .then(function (result) {
                expect(result).to.be.a('boolean')
                expect(result).to.equal(true)

                return doneTest()
              })
              .catch(doneTest)
          })
      })

      it('Should return false for Arya having access to Second Trial By Combat', function (doneTest) {
        K.Entity.query()
          .where('id', 11)
          .include('contributedVoices')
          .then(function (result) {
            var arya = result[0]

            arya.hasAccessToVoice(new K.Voice({ id: 2 }))
              .then(function (result) {
                expect(result).to.be.a('boolean')
                expect(result).to.equal(false)

                return doneTest()
              })
              .catch(doneTest)
          })
      })

    })

    describe('Contributed voices', function () {

      it('Should return true for Arya having access to Valyrian Roads', function (doneTest) {
        K.Entity.query()
          .where('id', 11)
          .include('contributedVoices')
          .then(function (result) {
            var arya = result[0]

            arya.hasAccessToVoice(new K.Voice({ id: 4 }))
              .then(function (result) {
                expect(result).to.be.a('boolean')
                expect(result).to.equal(false)

                return doneTest()
              })
              .catch(doneTest)
          })
      })

      it('Should return false for Arya having access to Robert\'s Rebellion', function (doneTest) {
        K.Entity.query()
          .where('id', 11)
          .include('contributedVoices')
          .then(function (result) {
            var arya = result[0]

            arya.hasAccessToVoice(new K.Voice({ id: 8 }))
              .then(function (result) {
                expect(result).to.be.a('boolean')
                expect(result).to.equal(false)

                return doneTest()
              })
              .catch(doneTest)
          })
      })

    })

    describe('Organization member voices', function () {

      it('Should return true for Jaime having access to Casterly Rock', function (doneTest) {
        K.Entity.query()
          .where('id', 5)
          .include('memberOrganizations.voices')
          .then(function (result) {
            var jaime = result[0]

            jaime.hasAccessToVoice(new K.Voice({ id: 15 }))
              .then(function (result) {
                expect(result).to.be.a('boolean')
                expect(result).to.equal(true)

                return doneTest()
              })
              .catch(doneTest)
          })
      })

      it('Should return false for Arya having access to Casterly Rock', function (doneTest) {
        K.Entity.query()
          .where('id', 11)
          .include('memberOrganizations.voices')
          .then(function (result) {
            var arya = result[0]

            arya.hasAccessToVoice(new K.Voice({ id: 15 }))
              .then(function (result) {
                expect(result).to.be.a('boolean')
                expect(result).to.equal(false)

                return doneTest()
              })
              .catch(doneTest)
          })
      })

    })

    describe('Organization owned voices', function () {

      it('Should return true for Cersei having access to Casterly Rock', function (doneTest) {
        K.Entity.query()
          .where('id', 3)
          .include('organizations.voices')
          .then(function (result) {
            var cersei = result[0]

            cersei.hasAccessToVoice(new K.Voice({ id: 15 }))
              .then(function (result) {
                expect(result).to.be.a('boolean')
                expect(result).to.equal(true)

                return doneTest()
              })
              .catch(doneTest)
          })
      })

      it('Should return false for Robert having access to Casterly Rock', function (doneTest) {
        K.Entity.query()
          .where('id', 17)
          .include('organizations.voices')
          .then(function (result) {
            var robert = result[0]

            robert.hasAccessToVoice(new K.Voice({ id: 15 }))
              .then(function (result) {
                expect(result).to.be.a('boolean')
                expect(result).to.equal(false)

                return doneTest()
              })
              .catch(doneTest)
          })
      })

    })

  })

  describe('#isFollowedBy', function () {

    it('Should return true for Tyrion followed by Jaime', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (result) {
          var tyrion = result[0]

          tyrion.isFollowedBy(new K.Entity({ id: 5 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(true)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

    it('Should return false for Tyrion followed by Cersei', function (doneTest) {
      K.Entity.query()
        .where('id', 1)
        .then(function (result) {
          var tyrion = result[0]

          tyrion.isFollowedBy(new K.Entity({ id: 3 }))
            .then(function (result) {
              expect(result).to.be.a('boolean')
              expect(result).to.equal(false)

              return doneTest()
            })
            .catch(doneTest)
        })
    })

  })

})
