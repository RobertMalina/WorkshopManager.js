const authHandler = require('./auth.handler');
const routesHandler = require('./routes.handler');
const jsonHandler = require('./json.handler');
const corsHandler = require('./cors.handler');
const spaHandler = require('./spa.handler');

module.exports = {
  authHandler: authHandler,
  routesHandler: routesHandler,
  jsonHandler: jsonHandler,
  corsHandler: corsHandler,
  spaHandler: spaHandler,
};
