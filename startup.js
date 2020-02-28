const AppServer = require('./server');

const {
  OrderController,
  AuthController,
  ClientController,
  WorkerController,
} = require('./controllers/controllers.index');
const {
  OrderService,
  WorkerService,
  ClientService,
  AuthService,
  TimeLogService,
} = require('./services/services.index');

//const roleService = new RoleService();

const authService = new AuthService();
const authController = new AuthController(authService);

const server = new AppServer({
  authService: authService,
  authProviderKey: 'JWT',
  port: '4210',
  dataFormat: 'JSON',
  CORS: true,
  endpoints: [
    authController,
    new OrderController(new OrderService(), new TimeLogService()),
    new ClientController(new ClientService()),
    new WorkerController(new WorkerService()),
  ],
});

server.start();

if (process.argv.indexOf('with-cli') !== -1) {
  console.log(
    'Server app instance was launched with a command line interface.',
  );
  const AppCli = require('./cli/app');
  const cliInstance = new AppCli();
  cliInstance.run();
}
