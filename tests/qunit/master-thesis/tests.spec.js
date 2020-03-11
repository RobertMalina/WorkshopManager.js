const { reduceObj } = require('../../../shared/tools');
const {
  units,
  memoryDiagnostics,
} = require('../../../shared/memory-diagnostics');

const session = memoryDiagnostics.session();

QUnit.module('Master Thesis test code suite', hooks => {
  hooks.beforeEach(() => {
    session.log(process.memoryUsage()).in(units.MB, 2);
  });
  hooks.after(() => {
    session.summarize();
  });

  QUnit.module(`Shared tools tests`, () => {
    QUnit.module(`reduceObj function:`, hooks => {
      let transformation, inputData, expectedData, output;

      hooks.before(() => {
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
      });

      hooks.beforeEach(() => {
        output = reduceObj(inputData, transformation, {});
      });

      QUnit.test('returns object without function-members', assert => {
        assert.deepEqual(output, expectedData);
      });
      QUnit.test('returns object without password', assert => {
        assert.deepEqual(output, expectedData);
      });
    });
  });

  const OrderController = require('../../../controllers/orders-controller');
  const { Action } = require('../../../controllers/base/action');

  QUnit.module(`Controller Action object tests`, () => {
    QUnit.module(`setAsRouteOf method:`, hooks => {
      hooks.before(() => {
        action = new Action('/count', 'GET', () => {}, {});
      });

      let controller, action;

      QUnit.test(
        'returns correct path when belongs to OrderController',
        assert => {
          controller = new OrderController({}, {});
          action.setAsRouteOf(controller);
          assert.equal(action.route, '/api/orders/count');
        },
      );
      QUnit.test('returns non-api path', assert => {
        controller = new OrderController(
          {},
          {},
          { isApiController: false, pluralize: true },
        );
        action.setAsRouteOf(controller);
        assert.equal(action.route, '/orders/count');
      });
      QUnit.test('returns "unpluralized" path', assert => {
        controller = new OrderController(
          {},
          {},
          { isApiController: true, pluralize: false },
        );
        action.setAsRouteOf(controller);
        assert.equal(action.route, '/api/order/count');
      });
    });
  });

  const QueryStore = require('../../../DAL/query-store');
  const registerParams = {
    firstName: 'Ania',
    lastName: 'Kowal',
    title: 'Wymiana chłodnicy',
    description:
      'Chłodnica przecieka w kilku miejscach, nie nadaje się do regeneracji.',
  };
  const phoneNumber = '443892502';
  const vehicleDescription = 'Alfa Giulietta 2011 1.6Mpi 120KM';

  QUnit.module(`QueryStore (sql queries parser) tests`, () => {
    const queryStore = new QueryStore();
    QUnit.module(`Order register-query parser`, () => {
      QUnit.test(`should throw error when no args are provided`, assert => {
        assert.throws(() => {
          queryStore.get('registerOrder');
        }, "Cannot destructure property `firstName` of 'undefined' or 'null'");
      });

      QUnit.test(
        `should throw error when phoneNumber and vehicleDescription is not provided`,
        assert => {
          assert.throws(() => {
            queryStore.get('registerOrder', registerParams);
          }, `phoneNumber is required, vehicleDescription is required, order register query terminated...`);
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

      QUnit.test(`should return expected query`, assert => {
        assert.equal(
          queryStore
            .get('registerOrder', {
              phoneNumber,
              vehicleDescription,
              ...registerParams,
            })
            .replace(/[\s]/g, ''),
          expectedQuery,
        );
      });
    });
  });

  const DbAccess = require('../../../DAL/db-access');
  const { getDbSettings, dbModes } = require('../../../server.config');
  const OrderService = require('../../../services/order-service');

  QUnit.module(`(async) Database integration tests`, hooks => {
    let orderId;

    hooks.after(() => {
      if (orderId) {
        const db = new DbAccess(getDbSettings(dbModes.TEST));
        const cleanUpQuery = `
        DECLARE @PhoneNumber CHAR(10) = '${phoneNumber}';
        DECLARE @OrderId BIGINT;
        SET @OrderId = (SELECT MAX([Id]) FROM [dbo].[Order]);
        DELETE FROM [dbo].[Order]  WHERE Id = @OrderId;
        DELETE FROM [dbo].[Client] WHERE [PhoneNumber] = @PhoneNumber;
        `;
        db.run(cleanUpQuery);
      }
    });

    QUnit.test(`register method should return new order Id`, assert => {
      const done = assert.async();
      const orderService = new OrderService(getDbSettings(dbModes.TEST));
      let isGreaterThanZero = false;
      orderService
        .registerOrder({
          phoneNumber,
          vehicleDescription,
          ...registerParams,
        })
        .then(response => {
          orderId = response;
          isGreaterThanZero = response > 0;
          assert.ok(isGreaterThanZero);
          done();
        })
        .catch(error => done(error));
    });
  });

  const AuthService = require('../../../services/auth/auth-service');

  QUnit.module(`User System features test`, () => {
    const authService = new AuthService(getDbSettings(dbModes.TEST));

    QUnit.module(`(async) hashPassword method`, () => {
      const password = 'zaq12wsx';

      QUnit.test(`returns anything`, assert => {
        const done = assert.async();
        authService.usersSystemApi.hashPassword(password).then(result => {
          assert.ok(result);
          done();
        });
      });
      QUnit.test(
        `returns string that is likely valid hash (has considerable length)`,
        assert => {
          const done = assert.async();
          let isLengthy = false;
          authService.usersSystemApi.hashPassword(password).then(result => {
            isLengthy = result.length > 20;
            assert.ok(isLengthy);
            done();
          });
        },
      );
    });
  });
});
