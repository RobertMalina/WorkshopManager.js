const DbAccess = require('../DAL/db-access');

const ClientService = function() {
  
  const db = new DbAccess();

  this.fetchClients = function() {
    return db.run('select * from [Client]')
      .catch((error)=> {
        console.error(error);
      });
  };

  this.findClientByPhoneNumber = function(phoneNumber) {
    return db.run(`select top 1 * from [Client] where [PhoneNumber] = '${phoneNumber}'`)
      .catch((error)=> {
        console.error(error);
      });
  };
};

module.exports = ClientService;
