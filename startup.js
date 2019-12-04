const AppServer = require('./server');
const OrderController = require('./controllers/orders-controller');
const AuthController = require('./controllers/auth-controller');
const OrderService = require('./services/order-service');
const AuthService = require('./services/auth-service');

const authService = new AuthService();
const server = new AppServer();
authService.secure(server.getInstance());

server.enableJSONBodyParsing();

const apiEndpoints = [
  new AuthController(authService),
  new OrderController(new OrderService())
];

server.registerRoutes(apiEndpoints);
server.startOn('4210');
