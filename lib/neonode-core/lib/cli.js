#!/usr/bin/env node

process.on('SIGINT', function() {
  process.exit();
});

var fs = require('fs');

var localNeonode =  process.cwd() + '/node_modules/neonode-core/lib/neonode.js';

var neonode, Neonode;

var isLocal = false;

if (fs.existsSync(localNeonode)) {
  Neonode = require(localNeonode);
  isLocal = true;
} else {
  Neonode = require('./neonode');
}

neonode = new Neonode({isLocal : isLocal});
