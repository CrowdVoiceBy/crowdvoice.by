'use strict'

// this should simply check if the profile name is already in use somewhere.

module.exports = function (requestedProfileName, callback) {
  var profileName = requestedProfileName.toLowerCase().trim()

  Entity.find({ profile_name: profileName }, function (err, result) {
    if (err) { return callback(err) }

    var isAvailable = true

    if (result.length > 0) {
      isAvailable = false
    }

    if (profileName.match(BlackListFilter.routesBlackList[1])) {
      isAvailable = false
    }

    return callback(null, isAvailable)
  })
}
