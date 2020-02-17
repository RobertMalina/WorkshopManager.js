const OrderService = require('./order-service');
const WorkerService = require('./workers-service');
const ClientService = require('./client-service');
const AuthService = require('./auth/auth-service');
const TimeLogService = require('./time-log-service');

module.exports = {
  OrderService: OrderService,
  WorkerService: WorkerService,
  ClientService: ClientService,
  AuthService: AuthService,
  TimeLogService: TimeLogService
};