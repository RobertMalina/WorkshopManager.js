const AppServer = require('./server');

const { OrderController, AuthController, ClientController, WorkerController, AppController }
 = require('./controllers/controllers.index');
const { OrderService, WorkerService, ClientService, AuthService, RoleService  }
 = require('./services/services.index');

 //const roleService = new RoleService();

const authService = new AuthService();
const authController = new AuthController(authService);
const server = new AppServer ({
  authService: authService,
  port: '4210'
});

//włączenie uwierzytelniania dostępu do api
// opcja oparta o Json Web Tokens
server.enableAuthentication('JWT');
// lub Passport-local:
//server.enableAuthentication('Passport-local');

server.enableJSONBodyParsing();

//jeśli implementowana byłaby aplikacja kliencka (w obrębie tego projektu)
//server.enableSPA();

//Aby umożliwić żądania z aplikacji webowych
server.enableCORS();

const endpoints = [
  authController,
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

