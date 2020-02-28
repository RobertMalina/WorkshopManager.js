const { invariant, requiredArg } = require('./shared/tools');
const express = require('express');
const { AuthService } = require('./services/services.index');
const { AppServerBehaviour } = require('./server.behaviour');

const AppServer = function(config) {
  config = config || requiredArg('config');

  function proxiedServer() {
    const serverCore = {
      start: function() {
        this.instance.listen(this.port);
        console.log(`server is listening on port: ${this.port}`);
      },

      instance: express(),
      actions: [],
      endpoints: null,
      port: null,
      authProviderKey: null,
      authService: null,
      dataFormat: null,
      CORS: null,
    };
    const proxyHandler = {
      get(serverCore, key) {
        invariant(key, 'get');
        return serverCore[key];
      },
      set(serverCore, key, value) {
        invariant(key, 'set');
        switch (key) {
          case 'start': {
            new Error('Express server start method is not overridable...');
            break;
          }
          case 'instance': {
            new Error('Express server instance is read-only!');
            break;
          }
          case 'endpoints': {
            if (!Array.isArray(value))
              new Error('Endpoints are expected to be an array...');
            break;
          }
          case 'actions': {
            new Error(
              'Express server registered actions property is read-only!',
            );
            break;
          }
          case 'authService':
            if (!value instanceof AuthService)
              new Error('Received auth service object has wrong type...');
            break;

          default:
            break;
        }
        serverCore[key] = value;
        return true;
      },
    };

    const proxy = new Proxy(serverCore, proxyHandler);

    return Object.assign(proxy, AppServerBehaviour(proxy));
  }

  const server = proxiedServer();

  const onRequestReceived = (req, res, next) => {
    console.log(`request with path: ${req.originalUrl} received...`);
    next();
  };

  const initialize = config => {
    server.port = config.port || process.env.DEFAULT_SRV_PORT;
    server.authService = config.authService || null;
    server.authProviderKey = config.authProviderKey || null;
    server.dataFormat =
      config.dataFormat || process.env.DEFAULT_SRV_DATA_FORMAT;

    server.CORS = config.CORS === false ? config.CORS : true;

    server.instance.use(onRequestReceived);
    server.endpoints = config.endpoints;

    if (server.authService) {
      server.authProviderKey ? server.enableAuthentication() : () => {};
    }

    if (server.dataFormat.toLowerCase() === 'json') {
      server.enableJSONBodyParsing();
    }

    if (server.CORS) {
      server.enableCORS();
    }

    server.registerRoutes(server.endpoints);
  };

  initialize(config);

  return server;
};

module.exports = AppServer;
