#!/usr/bin/env node
var path = require('path');
require(path.join(process.cwd(), 'lib', 'neonode-core'));

var models = [
  'Voice',
  'Post',
  'Entity',
  'Topic'
];

var model = process.argv[2];

if (model && models.indexOf(model) === -1) {
  console.log('Invalid Model')
  process.exit(0);
}

if (model) {
  models = [model];
}

async.eachLimit(models, 1, function(currentModel, nextModel) {
  global[currentModel].all(function(err, results) {
    if (err) {
      return nextModel(err);
    }

    async.eachLimit(results, 1, function(result, nextResult) {
      var instance = new global[currentModel](result);

      if (instance.image) {
        instance.image.processVersions(function(err) {
          if (err) {
            return nextResult(err);
          }

          console.log('Processed Image ' + instance.id + ' of ' + currentModel)

          instance.save(function(err, result) {
            if (err) {
              return nextResult(err);
            }

            nextResult();
          })
        });
      }
    }, function(err) {
      if (err) {
        return nextModel(err);
      }

      nextModel();
    });
  })
}, function(err) {
  if (err) {
    console.error(err);
    return process.exit(1);
  }

  console.log('Finished');
  process.exit(0);
});
