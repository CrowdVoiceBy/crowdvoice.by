var fs          = require('fs');

const CLI_VERSION = JSON.parse(fs.readFileSync(__dirname + '/../package.json', 'utf-8')).version;

require('colors');

var mkdirp      =  require('mkdirp');
var prompt      = require('prompt');
var ncp         = require('ncp').ncp;
var rmdir       = require('rimraf');
var inflection  = require('inflection');
var path        = require('path');

require('neon');
require('neon/stdlib');

require('fluorine');
require('thulium');

var nopt        = require("nopt");
var inflection  = require('inflection');

var Neonode = Class({}, 'Neonode')({
  prototype : {
    options : null,
    isLocal : false,
    knownOpts : {
      "init"    : Boolean,
      "update"  : Boolean,
      "help"    : Boolean,
      "create"  : String,
      "version" : Boolean
    },
    shortHands : {
      "h" : ["--help"],
      "-v" : ["--version"],
      "-u" : ["--update"]
    },

    init : function init(config) {
      Object.keys(config || {}).forEach(function (propertyName) {
          this[propertyName] = config[propertyName];
      }, this);

      this.options = nopt(this.knownOpts, this.shortHands, process.argv, 2);
      this.run();
    },

    showHelp : function showHelp() {
      var help = fs.readFileSync(__dirname + '/.././lib/neonode/templates/help.txt', 'utf8');
      console.log(help)
      this.exit();
    },

    showVersion : function showVersion() {
      console.log('Neonode Core Module version: ' + CLI_VERSION);

      this.exit();
    },

    run : function run() {
      var neonode = this;

      prompt.start();
      prompt.message = "Neonode: ".white;

      if (this.options.version) {
        this.showVersion();
      }

      if (this.options.update) {
        this.update();
      }

      if (this.options.init) {

        if (this.isLocal) {
          console.error("Can't init a Neonode app within a Neonode app".red);
          this.showHelp();
        }

        prompt.get({
          properties: {
            name: {
              description: "Whats your project name?".green,
              required : true,
              type : 'string',
              pattern : /^[[\w+-_]+$/,
              default : 'neonode',
              conform: function (value) {
                return true;
              }
            },
            description: {
              description: "Whats your project description?".green,
              required : true,
              type : 'string',
              default : ''
            },
            version: {
              description : "Whats your project version?".green,
              required : true,
              type : 'string',
              default : '0.0.1'
            }
          }
        }, function (err, result) {
          var cwd = process.cwd();
          var sourceDir = path.resolve(__dirname + '/../../../.');
          var destDir = cwd + '/' + result.name;

          // Create dir
          if (!fs.existsSync(destDir)) {
            console.log("Creating ./" + result.name + ' directory');
            mkdirp.sync(cwd + '/' + result.name);

            // Copy base project
            console.log('Copying base project structure...');
            ncp(sourceDir, destDir, function(err) {
              if (err) {
                console.log("Error".red);
                console.log(err);
              }

              console.log('Creating package.json ...');

              var pack = JSON.parse(fs.readFileSync(destDir + '/package.json', 'utf8'));

              pack.name = result.name;
              pack.description = result.description;
              pack.version = result.version;

              delete pack.repository;
              delete pack.readme;
              delete pack.readmeFilename;
              delete pack.bin;
              delete pack.gitHead;
              delete pack.bugs;
              delete pack.homepage;
              delete pack._shasum;
              delete pack._from;
              delete pack._resolved;

              fs.writeFileSync(destDir + '/package.json', JSON.stringify(pack, null, 2), 'utf8');

              rmdir.sync(destDir + '/node_modules');
              fs.unlinkSync(destDir + '/index.js');
              fs.unlinkSync(destDir + '/README.md');
              fs.unlinkSync(destDir + '/models/.deleteme');
              fs.closeSync(fs.openSync(destDir + '/README.md', 'w'));

              console.log('Done.'.green);
              console.log("\n");
              neonode.exit();
            });

          } else {
            console.log('Directory '.red + cwd.green + '/'.green + result.name.green + ' already exists'.red);
            neonode.exit();
          }

        });
      }

      if (this.options.create || this.options.create == '') {
        switch (this.options.create) {
          case 'model':
            this.createModel();
            break;
          case 'controller':
            this.createController();
            break;
          case '':
          default:
            this.showHelp()
            break;
        }
      }

      if (this.options.argv.original.length === 0 || this.options.help) {
        this.showHelp();
      }

    },

    createModel : function createModel() {
      var neonode = this;

      if (!this.isLocal) {
        console.error('Must be run in a Neonode app directory'.red);
        this.showHelp();
      }

      prompt.get({
        properties: {
          name: {
            description: "Whats the model name?".green,
            required : true,
            type : 'string',
            default : 'Users'
          }
        }
      }, function (err, result) {
        var cwd = process.cwd();
        var sourceFile = __dirname + '/.././lib/neonode/templates/Model.js';
        var destFile = cwd + '/models/' + inflection.singularize(result.name) + '.js';

        // Create dir
        if (!fs.existsSync(destFile)) {
          console.log("Creating ./models/" + inflection.singularize(result.name) + '.js Model');

          var file = fs.readFileSync(sourceFile, 'utf8');

          var template = new Thulium({
            template : file
          });

          template.parseSync().renderSync({
            name : result.name,
            singular : inflection.singularize(result.name)
          });

          var result =  template.view;

          fs.writeFileSync(destFile, result, 'utf8');

          console.log('Done'.green);
          neonode.exit();
        } else {
          console.log('Model '.red + result.name.green + ' already exists'.red);
          neonode.exit();
        }

      });
    },

    createController : function createController() {
      var neonode = this;

      if (!this.isLocal) {
        console.error('Must be run in a Neonode app directory'.red);
        this.showHelp();
      }

      prompt.get({
        properties: {
          name: {
            description: "Whats the Controller name?".green,
            required : true,
            type : 'string',
            default : 'Users'
          },
          restful: {
            message: 'Is it RESTful?'.green,
            required : true,
            validator: /yes|no?/,
            warning: 'Must respond yes or no',
            default: 'no'
          }
        }
      }, function (err, result) {
        var cwd = process.cwd();
        var sourceFile;

        if (result.restful === 'yes') {
          sourceFile = __dirname + '/.././lib/neonode/templates/RestfulController.js';
        } else {
          sourceFile = __dirname + '/.././lib/neonode/templates/Controller.js';
        }

        var destFile = cwd + '/controllers/' + result.name + 'Controller.js';

        // Create dir
        if (!fs.existsSync(destFile)) {
          console.log("Creating ./controllers/" + result.name + 'Controller.js');

          var file = fs.readFileSync(sourceFile, 'utf8');

          var template = new Thulium({
            template : file
          });

          template.parseSync().renderSync({
            name : result.name,
            singular :  inflection.singularize(result.name)
          });

          fs.writeFileSync(destFile, template.view, 'utf8');

          if (!fs.existsSync(cwd + '/views/' + result.name.toLowerCase())) {
            console.log('Creating ./views/' + result.name.toLowerCase() + ' directory');
            mkdirp.sync(cwd + '/views/' + result.name.toLowerCase());
          }

          if (result.restful === 'yes') {
            console.log('Creating RESTful views...');

            fs.closeSync(fs.openSync(cwd + '/views/' + result.name.toLowerCase() + '/index.html', 'w'));
            fs.closeSync(fs.openSync(cwd + '/views/' + result.name.toLowerCase() + '/show.html', 'w'));
            fs.closeSync(fs.openSync(cwd + '/views/' + result.name.toLowerCase() + '/new.html', 'w'));
            fs.closeSync(fs.openSync(cwd + '/views/' + result.name.toLowerCase() + '/edit.html', 'w'));
          }

          console.log('Done'.green);
          neonode.exit();
        } else {
          console.log('Controller '.red + result.name.green + ' already exists'.red);
          neonode.exit();
        }

      });
    },

    update : function update() {
      console.log('Please run: '.green + '"npm update neonode-core -save"'.bold + ' in your project');
    },

    exit : function exit(){
      process.exit(1);
    }
  }
});

module.exports = Neonode;
