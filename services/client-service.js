const DbAccess = require('../DAL/db-access');

const ClientService = function(
  dbConfig = require('../server.config').getDbSettings('-dev'),
) {
  const db = new DbAccess(dbConfig);

  this.fetchClients = function() {
    return db.run('select * from [Client]').catch(error => {
      console.error(error);
    });
  };

  this.findClientByPhoneNumber = function(phoneNumber) {
    return db
      .run(
        `select top 1 * from [Client] where [PhoneNumber] = '${phoneNumber}'`,
      )
      .catch(error => {
        console.error(error);
      });
  };

  this.deleteClient = phoneNumber => {
    return new Promise((resolve, reject) => {
      if (!phoneNumber) {
        reject('phoneNumber parameter is obligatory!');
      }
      console.log(`Deletion of client with phoneNumber: ${id} is proceeded.`);
      db.run(queryStore.get('deleteClient', { phoneNumber }))
        .then(response => {
          console.log(`Client with phoneNumber: ${id} succeeded.`, response);
          resolve(response);
        })
        .catch(error => {
          console.log(`Client with phoneNumber: ${id} failed.`, error);
          reject(error);
        });
    });
  };
};

module.exports = ClientService;
