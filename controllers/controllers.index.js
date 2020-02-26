const OrderController = require('./orders-controller');
const AuthController = require('./auth-controller');
const ClientController = require('./client-controller');
const WorkerController = require('./workers-controller');

module.exports = {
  OrderController: OrderController,
  AuthController: AuthController,
  ClientController: ClientController,
  WorkerController: WorkerController,
};
