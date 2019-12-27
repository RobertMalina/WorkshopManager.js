const Controller = require('./base/controller');
const Action = require('./base/action');
const errorHandler = require('./base/error-handler');

const WorkerController = function(/*workerService class*/ workerService) {
  
  Controller.call(this);

  const service = workerService;

  this.isApiController = true;

  this.getMechaniciansOfOrders = new Action('/engagedInOrders', 'POST',  
    function( req, res ) {
      const { ordersIds } = req.body;      
      res.setHeader('Content-Type', 'application/json');
      service
        .getWorkersOfOrders(ordersIds)
        .then(response => {
          return res.status(200).json(response);
        })
        .catch(err => {
          console.error(err);
          errorHandler(err);
        });
    },
    { authRequired: true, roles: ['admin'] }
  );

  this.getMechaniciansOfOrder = new Action('/engagedInOrder/:id', 'GET',  
    function( req, res ) {
      res.setHeader('Content-Type', 'application/json');
      const id = req.params.id;
      service
        .getWorkersOfOrder(id)
        .then(response => {
          return res.status(200).json(response);
        })
        .catch(err => {
          console.error(err);
          errorHandler(err);
        });
    },
    { authRequired: true, roles: ['admin'] }
  );
};

module.exports = WorkerController;
