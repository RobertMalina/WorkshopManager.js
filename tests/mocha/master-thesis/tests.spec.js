// const expect = require('chai').expect;
// const should = require('chai').should();
// const chai = require('chai');
// const chaiAsPromised = require('chai-as-promised');

// const { reduceObj } = require('../../../shared/tools');
// const {
//   units,
//   memoryDiagnostics,
// } = require('../../../shared/memory-diagnostics');

// const session = memoryDiagnostics.session();

// beforeEach('Memory usage logging', () => {
//   session.log(process.memoryUsage()).in(units.MB, 2);
// });

// after('Memory usage summarize', () => {
//   session.summarize();
// });

// describe(`Shared tools tests`, () => {
//   describe('reduceObj function:', () => {
//     let transformation, inputData, expectedData, output;

//     before(() => {
//       transformation = (data, val, key) => {
//         if (typeof val !== 'function' && key !== 'password') data[key] = val;
//         return data;
//       };

//       let loginDate = new Date();

//       inputData = {
//         maxAge: 360, // (seconds)
//         login: 'user0001',
//         loginDate,
//         password: 'zxc123',
//         getCredentials: function() {},
//         setCredentials: function(data) {},
//       };

//       expectedData = {
//         maxAge: 360,
//         login: 'user0001',
//         loginDate,
//       };
//     });

//     beforeEach(() => {
//       output = reduceObj(inputData, transformation, {});
//     });

//     it('returns object without function-members', () => {
//       expect(output).to.eql(expectedData);
//     });
//     it('returns object without password', () => {
//       output.should.eql(expectedData);
//     });
//   });
// });

// const OrderController = require('../../../controllers/orders-controller');
// const { Action } = require('../../../controllers/base/action');

// chai.use(require('chai-match')); // -> aby możliwe było użycie "to.match"

// describe(`Controller Action object tests`, () => {
//   describe('setAsRouteOf method:', () => {
//     let controller, action;

//     before(() => {
//       action = new Action('/count', 'GET', () => {}, {});
//     });

//     it('returns correct path when belongs to OrderController', () => {
//       controller = new OrderController({}, {});
//       action.setAsRouteOf(controller);
//       expect(action.route).to.equal('/api/orders/count');
//     });

//     it('returns non-api path', () => {
//       controller = new OrderController(
//         {},
//         {},
//         {
//           isApiController: false,
//           pluralize: true,
//         },
//       );
//       action.setAsRouteOf(controller);
//       action.route.should.equal('/orders/count');
//     });

//     it('returns "unpluralized" path', () => {
//       controller = new OrderController(
//         {},
//         {},
//         {
//           isApiController: true,
//           pluralize: false,
//         },
//       );
//       action.setAsRouteOf(controller);
//       expect(action.route).to.be.equal('/api/order/count');
//     });
//   });
// });

// const QueryStore = require('../../../DAL/query-store');
// const registerParams = {
//   firstName: 'Ania',
//   lastName: 'Kowal',
//   title: 'Wymiana chłodnicy',
//   description:
//     'Chłodnica przecieka w kilku miejscach, nie nadaje się do regeneracji.',
// };
// const phoneNumber = '443892502';
// const vehicleDescription = 'Alfa Giulietta 2011 1.6Mpi 120KM';

// describe(`QueryStore (sql queries parser) tests`, () => {
//   const queryStore = new QueryStore();

//   describe('Order register-query parser', () => {
//     it('should throw error when no args are provided', () => {
//       expect(() => {
//         queryStore.get('registerOrder');
//       }).to.throw(
//         "Cannot destructure property `firstName` of 'undefined' or 'null'",
//       );
//     });

//     it('should throw error when phoneNumber and vehicleDescription is not provided', () => {
//       expect(() => {
//         queryStore.get('registerOrder', registerParams);
//       }).to.throw(
//         `phoneNumber is required, vehicleDescription is required, order register query terminated...`,
//       );
//     });

//     const expectedQuery = `DECLARE @result VARCHAR(1024);
//       EXEC [spRegisterOrder]
//       @FirstName='${registerParams.firstName}',
//       @LastName='${registerParams.lastName}',
//       @PhoneNumber='${phoneNumber}',
//       @Title='${registerParams.title}',
//       @VehicleDescription='${vehicleDescription}',
//       @Description='${registerParams.description}',
//       @Response = @result OUTPUT;

//       SELECT @result AS 'result';`.replace(/[\s]/g, '');

//     it('should return expected query', () => {
//       const query = queryStore
//         .get('registerOrder', {
//           phoneNumber,
//           vehicleDescription,
//           ...registerParams,
//         })
//         .replace(/[\s]/g, '');
//       query.should.equal(expectedQuery);
//     });
//   });
// });

// const DbAccess = require('../../../DAL/db-access');
// const { getDbSettings, dbModes } = require('../../../server.config');
// const OrderService = require('../../../services/order-service');

// chai.use(chaiAsPromised).should();

// describe(`(async) Database integration tests`, () => {
//   let orderId;

//   it('register method should return new order Id', () => {
//     const orderService = new OrderService(getDbSettings(dbModes.TEST));
//     orderService
//       .registerOrder({
//         phoneNumber,
//         vehicleDescription,
//         ...registerParams,
//       })
//       .should.eventually.be.greaterThan(0);
//   });

//   after('test database changes rollback', () => {
//     const db = new DbAccess(getDbSettings(dbModes.TEST));
//     const cleanUpQuery = `
//       DECLARE @PhoneNumber CHAR(10) = '${phoneNumber}';
//       DECLARE @OrderId BIGINT;
//       SET @OrderId = (SELECT MAX([Id]) FROM [dbo].[Order]);
//       DELETE FROM [dbo].[Order]  WHERE Id = @OrderId;
//       DELETE FROM [dbo].[Client] WHERE [PhoneNumber] = @PhoneNumber;
//       `;
//     db.run(cleanUpQuery);
//   });
// });

// const AuthService = require('../../../services/auth/auth-service');

// describe('User System features test', () => {
//   let authService = new AuthService(getDbSettings(dbModes.TEST));

//   describe('(async) hashPassword method', () => {
//     const password = 'zaq12wsx';
//     let hashed;

//     it('returns anything', () => {
//       authService.usersSystemApi
//         .hashPassword(password)
//         .should.eventually.not.eql(undefined);
//     });

//     it('returns string that is likely valid hash (has considerable length)', () => {
//       return expect(authService.usersSystemApi.hashPassword(password))
//         .to.eventually.have.property('length')
//         .greaterThan(20);
//     });
//   });
// });

// const {
//   OrdersList,
// } = require('../../../master-thesis-common/orders-list.component');

// const jsdom = require('mocha-jsdom');

// jsdom({
//   html: `<!DOCTYPE html>`,
//   globalize: true,
// });

// describe.only(`DOM related tests`, () => {
//   let listObj,
//     placeholder,
//     placeholderId = 'orders-list-placeholder',
//     ordersService,
//     countSetter,
//     reloadBtn;
//   const listId = 'orders-list';

//   before(() => {
//     ordersService = new OrderService(getDbSettings(dbModes.DEVELOPMENT));
//     document.body.innerHTML = `
//       <input id="count-setter" type="number" value="5"/>>
//       <button id="reload-btn"></button>
//       <div id="${placeholderId}"></div>`;
//     placeholder = document.getElementById(placeholderId);
//     listObj = new OrdersList({
//       ordersService,
//       placeholder,
//       id: listId,
//     });
//     countSetter = document.getElementById('count-setter');
//     reloadBtn = document.getElementById('reload-btn');
//   });

//   it('OrdersList should have 5 items and then 2 items', async () => {
//     const listElement = await listObj.render(0, 5);
//     expect(listElement.querySelectorAll('.order.list-item').length).to.be(5);
//     countSetter.value = 2;
//     reloadBtn.addEventListener('click', () => {
//       listObj.render(0, countSetter.value).then(element => {
//         expect(element.querySelectorAll('.order.list-item').length).to.be(2);
//       });
//     });
//     reloadBtn.click();
//   });

//   it('OrdersList first item has valid phone number', async () => {
//     const listElement = await listObj.render(0, 5);
//     const firstItem = listElement.querySelector('.order.list-item');
//     const phoneNumber = firstItem.querySelector('.client-phone').innerHTML;
//     expect(parseInt(phoneNumber, 10)).not.to.be(NaN);
//   });
// });
