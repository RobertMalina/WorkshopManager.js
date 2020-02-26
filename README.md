# Workshop Manager System, Server application (backend)
Workshop Manager system consists of three layers:
- Relational database, I use MSSQL database instance, mounted on SQL Server 2017
- <b>Node.js service - and that is project covered by this repository</b>
- Client application - which purposes as user web interface, take a look at my repo: https://github.com/RobertMalina/WorkshopManagerClient.angular - where Angular 9 based application is stored

## WorkshopManagerServer features
Following parts can be separated in serverside:
- <b>Communication layer</b> - like for example in ASP.NET MVC app, there is controller's layer which purposes as remote communication interface. Due to use of Express.js features, api endpoints are registered with particullar, informative routes. I decided to separate controllers by it's model-specfic domain: e.g. I implemented OrdersController to reveal api points which enables paginated fetching of orders and registration of new order (and others).

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

  this.getSpentTimes = new Action('/spenttimes', 'POST', 
  function ( req,res ) {
    console.log(req.body);
    
    timeLogService
      .getSpentTimeLogs(req.body)
      .then(response => res.status(200).json(response))
      .catch(err => errorHandler(err, res));
  },
  
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

And in startup.js file (boot script, server app entry point), api endpoints are instantiated and "registered" in express.js server instance (note: this is only a part of startup.js script):

```js
server.enableCORS();

const endpoints = [
  authController,
  new OrderController(new OrderService(), new TimeLogService()),
  new ClientController(new ClientService()),
  new WorkerController(new WorkerService()),
  new AppController()
];

server.registerRoutes(endpoints);
server.startOn('4210');

```

And as a result, running Node.js server app produces following informative output when builded successfully:



- <b>Data access layer (DAL) module.</b> This layer communicates with local MSSQL database by using mssql package. At some extent this layer can be called as SQL query parser - depending on input params (transfered by web request) - query against db is constructed. Result query is in most cases an stored procedure || table-valued || scalar function invocation with some params, but in few cases raw sql is parsed.

- <b>Authentication server</b>
- <b>Cli manager</b>
