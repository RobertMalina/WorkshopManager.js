const AppServer = function() {
  const express = require('express');
  const path = require('path');
  const routeTable = {};
  const server = express();
  const CORS = require('cors');
  this.port = null;

  this.getInstance = function(){
    return server;
  }

  const onInit = function() {
    server.use(express.static(path.join(__dirname, 'public')));
    server.use('/scripts', express.static(`${__dirname}/node_modules/`));
    server.use(onRequestReceived);
  };

  const onRequestReceived = function(req, res, next) {
    console.log(`request with path: ${req.originalUrl} received...`);
    next();
  };

  this.startOn = function(port) {
    this.port = port;
    server.listen(this.port);
    console.log(`server is listening on port: ${this.port}`);
  };

  this.enableSPA = function(){
    const Handlebars = require('express-handlebars');
    server.use((req, res) => {
      if(req.originalUrl.indexOf('/app/') !== -1){
        console.log('SPA mode active, layout change route detected. Redirrection to index.html file...')
        res.sendFile(`${__dirname}/public/index.html`)
      }
    });
    server.set('view engine', 'hbs');

    server.engine( 'hbs', Handlebars( {
      extname: 'hbs',
      defaultView: 'default',
      layoutsDir: __dirname + '/public/views/pages/',
      partialsDir: __dirname + '/public/views/partials/'
    }));  
  }

  this.enableJSONBodyParsing = function(){
    const bodyParser = require('body-parser');
    server.use( bodyParser.json() );
    server.use(bodyParser.urlencoded({
      extended: true
    })); 
  };

  const isActionValid = function(action) {
    if (!action.httpVerb) {
      console.error('Brak typu akcji...');
      return false;
    }
    if (!action.route) {
      console.error('Brak trasy dla akcji...');
      return false;
    }
    if (!action.run || !isFunction(action.run)) {
      console.error('Brak funkcji wywołania zwrotnego dla akcji...');
      return false;
    }
    return true;
  };

  const isFunction = function(func) {
    return func && {}.toString.call(func) === '[object Function]';
  };

  this.authenticate = function(req, res, next) {
    console.log('request requires authentication...');
    next();
  };

  this.enableCORS = function() {
    server.use(CORS());
    console.log('CORS constraints disabled for incomming requests');
    server.use((req, res, next) => {
      console.log(`Access-Control-Allow-Origin headers added to incoming request...`);
      res.header("Access-Control-Allow-Origin", "*");
      res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      next();
    });
  }

  this.registerRoutes = function(controllers) {
    for (let i = 0; i < controllers.length; i++) {
      let controller = controllers[i];

      const actions = controller.getActions();

      for (const key in actions) {
        let action = actions[key];
        if (isActionValid(action)) {
          if (action.authRequired) {
            server.use(action.route, this.authenticate);
          }
          switch (action.httpVerb) {
            case 'GET': {
              server.get(action.route, action.run);
              console.log(`GET type action registered, route: ${action.route}`);
              break;
            }
            case 'POST': {
              server.post(action.route, action.run);
              console.log(`POST type action registered, route: ${action.route}`);
              break;
            }
            default: {
              break;
            }
          }
        }
      }
    }
  };
  onInit();
};

module.exports = AppServer;
