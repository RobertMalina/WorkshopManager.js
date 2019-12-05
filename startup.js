const AppServer = require('./server');
const OrderController = require('./controllers/orders-controller');
const AuthController = require('./controllers/auth-controller');
const AppController = require('./controllers/app-controller');
const OrderService = require('./services/order-service');
const AuthService = require('./services/auth-service');

const authService = new AuthService();
const server = new AppServer();
authService.secure(server.getInstance());
server.authenticate = function(req, res, next) {
  console.log(`passport-authentication: isAuthenticated = ${req.isAuthenticated()}`)
  if (req.isAuthenticated())
    next();
  else{
    res.redirect("/app/login");
  }
};

server.enableJSONBodyParsing();
//server.enableSPA();

const endpoints = [
  new AuthController(authService),
  new OrderController(new OrderService()),
  new AppController()
];

server.registerRoutes(endpoints);
server.startOn('4210');