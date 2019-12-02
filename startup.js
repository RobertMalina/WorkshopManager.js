require('dotenv').config();

const AppServer = require('./server');
const OrderController = require('./controllers/orders-controller');
const OrderService = require('./services/order-service');

const server = new AppServer();

const apiEndpoints = [new OrderController(new OrderService())];

server.registerRoutes(apiEndpoints);
server.startOn('4210');
