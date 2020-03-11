const { reduceObj } = require('../../../shared/tools');
const {
  units,
  memoryDiagnostics,
} = require('../../../shared/memory-diagnostics');

const ava = require('ava');

const session = memoryDiagnostics.session();

ava.before('before hook', function() {
  console.log('before');
});

ava.beforeEach('Memory usage logging', testCtx => {
  session.log(process.memoryUsage()).in(units.MB, 2);
});

ava.after('Memory usage summarize and test-db changes rollback', testCtx => {
  session.summarize();

  const db = new DbAccess(getDbSettings(dbModes.TEST));
  const cleanUpQuery = `
    DECLARE @PhoneNumber CHAR(10) = '${phoneNumber}';
    DECLARE @OrderId BIGINT;
    SET @OrderId = (SELECT MAX([Id]) FROM [dbo].[Order]);
    DELETE FROM [dbo].[Order]  WHERE Id = @OrderId;
    DELETE FROM [dbo].[Client] WHERE [PhoneNumber] = @PhoneNumber;
    `;
  db.run(cleanUpQuery);
});

let transformation, inputData, expectedData, output;

transformation = (data, val, key) => {
  if (typeof val !== 'function' && key !== 'password') data[key] = val;
  return data;
};

let loginDate = new Date();

inputData = {
  maxAge: 360, // (seconds)
  login: 'user0001',
  loginDate,
  password: 'zxc123',
  getCredentials: function() {},
  setCredentials: function(data) {},
};

expectedData = {
  maxAge: 360,
  login: 'user0001',
  loginDate,
};

output = reduceObj(inputData, transformation, {});

ava(
  'Shared tools tests, reduceObj function: returns object without function-members',
  testCtx => {
    testCtx.deepEqual(output, expectedData);
  },
);

output = reduceObj(inputData, transformation, {});

ava(
  'Shared tools tests, reduceObj function: returns object without password',
  testCtx => {
    testCtx.deepEqual(output, expectedData);
  },
);

const OrderController = require('../../../controllers/orders-controller');
const { Action } = require('../../../controllers/base/action');

let controller, action;

action = new Action('/count', 'GET', () => {}, {});

ava(
  `Controller Action object tests, setAsRouteOf method: returns correct path when belongs to OrderController`,
  testCtx => {
    controller = new OrderController({}, {});
    action.setAsRouteOf(controller);
    testCtx.is(action.route, '/api/orders/count');
  },
);

ava(
  `Controller Action object tests, setAsRouteOf method: returns non-api path`,
  testCtx => {
    controller = new OrderController(
      {},
      {},
      {
        isApiController: false,
        pluralize: true,
      },
    );
    action.setAsRouteOf(controller);
    testCtx.is(action.route, '/orders/count');
  },
);

ava(
  `Controller Action object tests, setAsRouteOf method: returns "unpluralized" path`,
  testCtx => {
    controller = new OrderController(
      {},
      {},
      {
        isApiController: false,
        pluralize: true,
      },
    );
    action.setAsRouteOf(controller);
    testCtx.is(action.route, '/orders/count');
  },
);

const QueryStore = require('../../../DAL/query-store');
const queryStore = new QueryStore();

const registerParams = {
  firstName: 'Ania',
  lastName: 'Kowal',
  title: 'Wymiana chłodnicy',
  description:
    'Chłodnica przecieka w kilku miejscach, nie nadaje się do regeneracji.',
};
const phoneNumber = '443892502';
const vehicleDescription = 'Alfa Giulietta 2011 1.6Mpi 120KM';

ava(
  `QueryStore (sql queries parser) tests, Order register-query parser: should throw error when no args are provided`,
  testCtx => {
    try {
      queryStore.get('registerOrder');
    } catch (err) {
      testCtx.is(
        err.message,
        "Cannot destructure property `firstName` of 'undefined' or 'null'.",
      );
    }
  },
);

ava(
  `QueryStore (sql queries parser) tests, Order register-query parser: should throw error when phoneNumber and vehicleDescription is not provided`,
  testCtx => {
    try {
      queryStore.get('registerOrder', registerParams);
    } catch (err) {
      testCtx.is(
        err.message,
        'phoneNumber is required, vehicleDescription is required, order register query terminated...',
      );
    }
  },
);

const expectedQuery = `DECLARE @result VARCHAR(1024);
EXEC [spRegisterOrder] 
@FirstName='${registerParams.firstName}',
@LastName='${registerParams.lastName}',
@PhoneNumber='${phoneNumber}', 
@Title='${registerParams.title}', 
@VehicleDescription='${vehicleDescription}',
@Description='${registerParams.description}',
@Response = @result OUTPUT;

SELECT @result AS 'result';`.replace(/[\s]/g, '');

ava(
  `QueryStore (sql queries parser) tests, Order register-query parser: should return expected query`,
  testCtx => {
    const query = queryStore
      .get('registerOrder', {
        phoneNumber,
        vehicleDescription,
        ...registerParams,
      })
      .replace(/[\s]/g, '');
    testCtx.is(query, expectedQuery);
  },
);

const DbAccess = require('../../../DAL/db-access');
const { getDbSettings, dbModes } = require('../../../server.config');
const OrderService = require('../../../services/order-service');

ava(
  `(async) Database integration tests, register method should return new order Id`,
  async testCtx => {
    const orderService = new OrderService(getDbSettings(dbModes.TEST));
    testCtx.truthy(
      await orderService.registerOrder({
        phoneNumber,
        vehicleDescription,
        ...registerParams,
      }),
    );
  },
);

ava.after('test database changes rollback', testCtx => {});

const AuthService = require('../../../services/auth/auth-service');
const password = 'zaq12wsx';
const authService = new AuthService(getDbSettings(dbModes.TEST));

ava(
  `(async) User System features test, hashPassword method: returns anything`,
  async testCtx => {
    testCtx.truthy(await authService.usersSystemApi.hashPassword(password));
  },
);

ava(
  `(async) User System features test, hashPassword method: returns string that is likely valid hash (has considerable length)`,
  async testCtx => {
    const result = await authService.usersSystemApi.hashPassword(password);
    const isLengthy = result.length > 20;
    testCtx.true(isLengthy);
  },
);

// async test

// ava('bar', async t => {
//   const bar = Promise.resolve('bar');
//   t.is(await bar, 'bar');
// });
