const AppServer = require('./server');

const OrderController = require('./controllers/orders-controller');
const AuthController = require('./controllers/auth-controller');
const AppController = require('./controllers/app-controller');
const ClientController = require('./controllers/client-controller');
const OrderService = require('./services/order-service');
const WorkerController = require('./controllers/workers-controller');
const WorkerService = require('./services/workers-service');
const ClientService = require('./services/client-service');
const AuthService = require('./services/auth-service');

const authService = new AuthService();
const server = new AppServer();

//włączenie uwierzytelniania dostępu do api
//authService.secure(server.getInstance());

server.enableJSONBodyParsing();

//jeśli implementowana byłaby aplikacja kliencka (w obrębie tego projektu)
//server.enableSPA();

//Aby umożliwić żądania z aplikacji webowych
server.enableCORS();

const endpoints = [
  new AuthController(authService),
  new OrderController(new OrderService()),
  new ClientController(new ClientService()),
  new WorkerController(new WorkerService()),
  new AppController()
];

server.registerRoutes(endpoints);
server.startOn('4210');

if(process.argv.indexOf('with-cli') !== -1 ){
  console.log('Server app instance was launched with a command line interface.')
  const AppCli = require('./cli/app');
  const cliInstance = new AppCli();
  cliInstance.run();
}

