const AppServer = function() {
  const express = require('express');
  const path = require('path');
  const routeTable = {};
  const server = express();
  this.port = null;

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
  };

  this.enableJSONBodyParsing = function(){
    var bodyParser = require('body-parser');
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

  const authenticate = function(req, res, next) {
    console.log('request requires authentication...');
    next();
  };

  this.registerRoutes = function(controllers) {
    for (let i = 0; i < controllers.length; i++) {
      let controller = controllers[i];

      const actions = controller.getActions();

      for (const key in actions) {
        let action = actions[key];
        if (isActionValid(action)) {
          if (action.authRequired || action.roles) {
            server.use(action.route, authenticate);
          }
          switch (action.httpVerb) {
            case 'GET': {
              server.get(action.route, action.run);
              break;
            }
            case 'POST': {
              server.post(action.route, action.run);
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
