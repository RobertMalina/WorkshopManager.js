const Controller = require('./controllers/base/controller');
const { checkAction, Action } = require('./controllers/base/action');
const CORS = require('cors');
const express = require('express');
const path = require('path');
const { AuthService } = require('./services/services.index');

const AppServer = function(
  /* { 
  port?: string, 
  authService?: AuthService
}*/ config,
) {
  config = config || {};
  const actions = [];

  const server = express();
  this.port = config.port || '4210';
  if (!config.authService instanceof AuthService) {
    console.error('Received AuthService object has wrong type...');
    this.authService = null;
  } else {
    this.authService = config.authService || null;
  }

  this.enableAuthentication = (providerKey /*:string*/) => {
    if (this.authService !== null) {
      this.authService.setAuthentication({
        target: this,
        provider: providerKey,
      });
      return true;
    } else {
      console.error(
        'AuthService is not provided to this instance of AppServer!',
      );
      return false;
    }
  };

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

  this.enableSPA = function() {
    const Handlebars = require('express-handlebars');
    server.use((req, res) => {
      if (req.originalUrl.indexOf('/app/') !== -1) {
        console.log(
          'SPA mode active, layout change route detected. Redirrection to index.html file...',
        );
        res.sendFile(`${__dirname}/public/index.html`);
      }
    });
    server.set('view engine', 'hbs');

    server.engine(
      'hbs',
      Handlebars({
        extname: 'hbs',
        defaultView: 'default',
        layoutsDir: __dirname + '/public/views/pages/',
        partialsDir: __dirname + '/public/views/partials/',
      }),
    );
  };

  this.enableJSONBodyParsing = function() {
    const bodyParser = require('body-parser');
    server.use(bodyParser.json());
    server.use(
      bodyParser.urlencoded({
        extended: true,
      }),
    );
  };

  //@to override
  authHandlerStub = (req, res, next) => {
    console.warn(
      'Action that required authentication is invoked, but there is no auth-provider provided (default fake-provider is used)...',
    );
    next();
  };

  authenticate = function(req, res, next) {
    authHandlerStub(req, res, next);
  };

  //debug
  this.setAuthenticateRoutine = func => {
    authenticate = func;
  };

  this.getActionByPath = actionPath => {
    return actions.find(a => a.path === actionPath);
  };

  this.enableCORS = function(options) {
    options = options || {};

    const configuration = require('./server.config');

    const whitelist = configuration.CORS.allowedClients;

    const corsConfig = {
      origin: function(origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(
            `Received request from untrusted origin (${origin}). Response blocked due to CORS policy.`,
          );
        }
      },
    };

    server.use(CORS(corsConfig));
  };

  this.registerRoutes = function(
    /*array of (instance of) Controller*/ controllers,
  ) {
    const results = [];
    for (let i = 0; i < controllers.length; i++) {
      let controller = controllers[i];
      if (!controller instanceof Controller) {
        console.warn(
          'One of passed routes provider is not instance of Controller, routes registration failed...',
          controller,
        );
        return null;
      }

      // const actions = controller.getActions().sort( (a,b) =>{
      //   if(a.authRequired && !b.authRequired){
      //     return -1;
      //   }
      //   else if(!a.authRequired && b.authRequired){
      //     return 1;
      //   }
      //   return 0;
      // });

      const actions = controller.getActions();

      for (const key in actions) {
        let action = actions[key];
        if (checkAction(action).isOk) {
          if (action.authRequired) {
            server.use(action.route, authenticate);
          }

          action.httpVerb = action.httpVerb.toUpperCase();
          switch (action.httpVerb) {
            case 'GET': {
              server.get(action.route, action.run);
              break;
            }
            case 'POST': {
              server.post(action.route, action.run);
              break;
            }
            case 'PUT': {
              server.put(action.route, action.run);
              break;
            }
            case 'DELETE': {
              server.delete(action.route, action.run);
              break;
            }
            default: {
              break;
            }
          }
          results.push(action.asRegistrationResult());
          actions.push(action);
        } else {
          let errMsg = checkAction(action).msg;
          results.push(action.asRegistrationResult({ errMsg: errMsg }));
        }
      }
    }
    printRegisteredRoutes(results);
    return results;
  };

  const printRegisteredRoutes = function(
    /*array of { registered:bool, type:string, route: string }*/ registerResults,
  ) {
    registerResults = registerResults.sort((a, b) => {
      if (a.registered) {
        return -1;
      }
      if (a.registered && b.registered) {
        return 0;
      } else {
        return 1;
      }
    });
    console.log('server registered endpoints:');
    registerResults.forEach(action => {
      if (action.registered) {
        console.log(
          `${action.type.toUpperCase()} \t: ${action.route}${
            action.authRequired ? '\t(Secured)' : ''
          }`,
        );
      } else {
        console.warn(
          `Some issues have been deteced while registration of the route: ${res.errMsg}`,
        );
      }
    });
  };

  onInit();
};

module.exports = AppServer;
