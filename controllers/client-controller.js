const Controller = require('./base/controller');
const Action = require('./base/action');
const errorHandler = require('./base/error-handler');

const ClientController = function(/*ClientService class*/ clientService) {
  
  Controller.call(this);

  const service = clientService;

  this.isApiController = true;

  this.getClients = new Action('', 'GET',  
    function( req, res ) {
      res.setHeader('Content-Type', 'application/json');
      service
        .fetchClients()
        .then(response => {
          const client = response.recordset.length !== 0 ? response.recordset[0] : null;
          return res.status(200).json(client);
        })
        .catch(err => {
          console.error(err);
          errorHandler(err);
        });
    },
    { authRequired: true, roles: ['admin'] }
  );

  this.getClient = new Action('/:phoneNumber', 'GET', 
    function ( req,res ) {
      res.setHeader('Content-Type', 'application/json');
      const phoneNumber = req.params.phoneNumber;
      service
        .findClientByPhoneNumber(phoneNumber)
        .then(response => {
          return res.status(200).json(response.recordset);
        })
        .catch(error => {
          console.error(error);
          errorHandler(err);
        });
    },
    { authRequired: true }
  );
};

module.exports = ClientController;
