const QueryStore = require('../DAL/query-store');

const TimeLogService = function() {

  this.getSpentTimeLogs = ({ ordersIds }) => {
    return new Promise((resolve, reject) => {

      const query = queryStore
        .get('selectSpentTimes', { ordersIds });

      db.run(query)
      .then( response =>
        {
          response = flatten(response);
          console.log('time-logs',response);    
          resolve(response);
        })
      .catch( err => reject(err));
    });
  }
}

module.exports = TimeLogService;