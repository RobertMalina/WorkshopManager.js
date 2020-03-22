const getTestData = require('../../helpers/test-data-reader');
const defResponse = getTestData('./tests/db-responses/raw/default.json');

const mock = (constructor, name) => {
  const keys = [];
  const methodNames = Object.getOwnPropertyNames(constructor.prototype);

  for (let methodName of methodNames) {
    keys.push(methodName);
  }
  return keys.length > 0 ? jasmine.createSpyObj(name || 'mock', keys) : {};
};

const dbCtx = jasmine.createSpyObj('DbAccess', {
  run: new Promise(resolve => resolve(defResponse)),
  insertMany: new Promise(resolve => resolve(defResponse)),
  insert: new Promise(resolve => resolve(defResponse)),
});

const create = () => {
  return jasmine.createSpyObj('DbAccess', {
    run: new Promise(resolve => resolve(defResponse)),
    insertMany: new Promise(resolve => resolve(defResponse)),
    insert: new Promise(resolve => resolve(defResponse)),
  });
};

module.exports = {
  create,
};
