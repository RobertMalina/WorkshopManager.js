const {
  authHandler,
  routesHandler,
  jsonHandler,
  corsHandler,
  spaHandler,
} = require('./server/server.handler.index');

const printHandler = () => ({
  printRegisteredRoutes: registerResults => {
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
          `Some issues occured while registration of the route: ${res.errMsg}`,
        );
      }
    });
  },
});

const AppServerBehaviour = server =>
  Object.assign(
    {},
    authHandler(server),
    corsHandler(server),
    jsonHandler(server),
    routesHandler(server),
    spaHandler(server),
    printHandler(),
  );

module.exports = {
  AppServerBehaviour: AppServerBehaviour,
};
