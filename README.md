# Workshop Manager System, Server application (backend)
Workshop Manager system consists of three layers:
- Relational database, I use MSSQL database instance, mounted on SQL Server 2017
- <b>Node.js service - and that is project covered by this repository and this readme</b>
- Client application - which purposes as user web interface, take a look at my repo: https://github.com/RobertMalina/WorkshopManagerClient.angular - where Angular 9 based application is stored

## WorkshopManagerServer features
Following parts can be separated in serverside:
- <b>Communication layer</b> - like for example in ASP.NET MVC app, sever code implements controller's layer which purposes as remote communication interface. Due to use of Express.js features, api endpoints are registered with particullar, informative routes. I decided to separate controllers by it's model-specfic domain: e.g. I implemented OrdersController to reveal api points which enables paginated fetching of orders and registration of new order (and others).

here is an example code of controller's "class" (OrderController), note that I have implemented some base "class" and "Action" type (imported at the top of the script):

```js
const Controller = require('./base/controller');
const { Action } = require('./base/action');
const errorHandler = require('./base/error-handler');

const OrderController = function(
  /*OrderService class*/ oService,
  /*TimeLogService class*/ tlService
  ) {

  const ordersService = oService;
  const timeLogService = tlService;
  
  Controller.call( this, {
    isApiController: true,
    pluralize: true
  });

  this.getSpentTimes = new Action('/spenttimes','POST',
    (req, res) => {
      timeLogService
        .getSpentTimeLogs(req.body)
        .then(response => res.status(200).json(response))
        .catch(err => errorHandler(err, res));
    },
    { authRequired: true, roles: ['regular, supervisor'] },
  );

  this.getPagedOrders = new Action('/paged','POST',
    (req, res) => {
      ordersService
        .fetchAsPageContent(req.body)
        .then(result => res.status(200).json(result))
        .catch(err => errorHandler(err, res));
    },
    { authRequired: true, roles: ['regular'] },
  );
  
  /*
  
   ... rest of OrdersController "class" code)
  
  */
};

OrderController.prototype = Object.create(Controller.prototype);

Object.defineProperty(OrderController.prototype, 'constructor', {
  value: OrderController,
  enumerable: false,
  writable: true,
});

module.exports = OrderController;

```

Then, in startup.js file (boot script, server app entry point), api endpoints are instantiated and "registered" in express.js server instance using constructor function (of "class" AppServer):

```js
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

```

And as a result, running Node.js server app produces following informative output when builded successfully:

![Alt text](/docs/server-boot.PNG?raw=true "Server application post-boot output")

- <b>Data access layer (DAL) module.</b> This layer communicates with local MSSQL database by using mssql package. At some extent this layer can be called as SQL query parser - depending on input params (transfered by web request) - query against db is constructed. Result query is in most cases an stored procedure || table-valued || scalar function invocation with some params, but in few cases raw sql is parsed.

- <b>Authentication server</b> - User system (db-structure purposed auth & authorization tasks only) is located at same database as bussines logic tables, so DAL module has access to User system data - and that way it provides an option to read user by identity and compare shipped password (from angular's app login page) with stored password hash. I hash password using Bcrypt with salting and then store it in database with user unique login (username). As an authorization medium I decided to use Json Web Token, signed with HS256 alghoritm. Implementation is ready to extract JWT token both from Authorization header and request body.

- <b>Cli manager</b> - using <i>readline</i> package - I implemented simply CLI shell over server - <b>which is possible to invoke by using additional params in npm start command 'npm run with-cli'</b>. Cli app allows to change configuration - e.g. change database instance to which server application connects.
