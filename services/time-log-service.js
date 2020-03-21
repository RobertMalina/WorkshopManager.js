const QueryStore = require('../DAL/query-store');
const DbAccess = require('../DAL/db-access');
const { digest } = require('../DAL/Models/entity');

const TimeLogService = function() {
  const queryStore = new QueryStore();
  const db = new DbAccess(require('../server.config').getDbSettings('-dev'));

  this.getSpentTimeLogs = ({ ordersIds }) => {
    return new Promise((resolve, reject) => {
      const query = queryStore.get('selectSpentTimes', { ordersIds });

      console.log(query);

      db.run(query)
        .then(response => {
          response = digest(response, { modelsName: 'spentTimes' });
          console.log('time-logs', response);
          resolve(response);
        })
        .catch(err => reject(err));
    });
  };
};

module.exports = TimeLogService;
