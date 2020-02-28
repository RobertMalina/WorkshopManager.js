const Controller = require('../controllers/base/controller');
const { checkAction, Action } = require('../controllers/base/action');

const routesHandler = server => ({
  registerRoutes: () => {
    if (!server.endpoints)
      new Error('Server must be instantiated with at least one endpoint...');

    const registerOutputs = [];

    server.endpoints.forEach(controller => {
      if (!controller instanceof Controller) {
        new Error(
          'One of passed routes provider is not instance of Controller, routes registration failed...',
        );
      }
      const actions = controller.getActions();

      for (const key in actions) {
        let action = actions[key];
        if (checkAction(action).isOk) {
          if (action.authRequired) {
            server.instance.use(
              action.route,
              server.authenticate ||
                function() {
                  console.warn('Authentication is not implemented');
                },
            );
          }

          action.httpVerb = action.httpVerb.toUpperCase();
          switch (action.httpVerb) {
            case 'GET': {
              server.instance.get(action.route, action.run);
              break;
            }
            case 'POST': {
              server.instance.post(action.route, action.run);
              break;
            }
            case 'PUT': {
              server.instance.put(action.route, action.run);
              break;
            }
            case 'DELETE': {
              server.instance.delete(action.route, action.run);
              break;
            }
            default: {
              break;
            }
          }
          registerOutputs.push(action.asRegistrationResult());
          actions.push(action);
        } else {
          let errMsg = checkAction(action).msg;
          registerOutputs.push(action.asRegistrationResult({ errMsg: errMsg }));
        }
      }
    });

    if (typeof server.printRegisteredRoutes === 'function') {
      server.printRegisteredRoutes(registerOutputs);
    }

    return registerOutputs;
  },
});

module.exports = routesHandler;
