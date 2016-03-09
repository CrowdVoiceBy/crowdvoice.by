var Application = Class({}, 'Application')({
  prototype : {
    express           : null,
    http              : null,
    server            : null,
    io                : null,
    router            : null,
    env               : CONFIG.environment,
    db                : db,

    init : function (){
      logger.info("Initializing Application");

      this.express = express;
      this.http = http;

      this.app = this.express();

      this.server = this.http.createServer(this.app);

      logger.info("Application Initialized");

      logger.info("Execute application._serverStart() to start the server");

      return this;
    },

    _configureApp : function(){
      var application = this;

      // *************************************************************************
      //                  Setup Thulium engine for Express
      // *************************************************************************
      logger.info("Setting Thulium Engine for Express");
      this.app.engine('html', require('thulium-express'));
      this.app.set('view engine', 'html');
      this.app.set('views', 'views');

      this.app.enable("trust proxy");

      // *************************************************************************
      //                            Static routes
      // *************************************************************************
      this.app.use('/', this.express.static('public'));

      // *************************************************************************
      //                            Request Logging
      // *************************************************************************
      this.app.use(morgan('combined', {stream: logger.stream}));

      // *************************************************************************
      //                            Init Router
      // *************************************************************************
      this.router = this.express.Router();

      // *************************************************************************
      //                            MiddleWares
      // *************************************************************************
      logger.info("Setting up middlewares...");

      // *************************************************************************
      //                      External Middlewares
      // *************************************************************************
      glob.sync("middlewares/*.js").forEach(function(file) {
        logger.info('Loading external middleware: ' + file + '...')
        var middleware = require(path.join(cwd, '/' + file));

        application.app.use(middleware);
      });

      return this;
    },

    _serverStart : function(){
      this.server.listen(CONFIG.port);
    },

    loadControllers : function(){
      var application = this;

      this._configureApp();

      logger.info('Loading Models');

      require('./models/Model');
      require('./models/KnexStorage');
      require('./models/ValidationSupport');
      require('./models/KnexModel');

      glob.sync("models/*.js").forEach(function(file) {
        logger.info('Loading ' + file + '...')
        var model = require(path.join(cwd, '/' + file));
      });

      logger.info('Loading RestfulController.js');
      require('./controllers/RestfulController.js');

      logger.info('Loading ApplicationController.js');
      require('./controllers/ApplicationController.js');

      var route;

      glob.sync("controllers/**/*.js").forEach(function(file) {
        logger.info('Loading ' + file + '...')
        var controller = require(path.join(cwd, '/' + file));
      });

      return this;
    }
  }
});

//Startup
module.exports = new Application();
