const sinon = require('sinon');
const defResponse = require('../db-responses/raw/default.json');
const dbConfig = require('../../server.config').getDbSettings('-dev');
const DbAccess = require('../../DAL/db-access');

const createMock = () => {
  const dbAccess = new DbAccess(dbConfig);
  const runStub = sinon.stub(dbAccess, 'run');
  runStub.returns(
    new Promise(resolve => {
      resolve(defResponse);
    }),
  );

  dbAccess.dispose = () => {
    runStub.resetHistory();
  };
  return dbAccess;
};

module.exports = {
  createMock,
};
