const { isString } = require('../shared/tools');

const QueryStore = function () {
  const sqlQueries = {
    //[AppUser]
    selectAppUser: function(args) {
      if(!args.identifier) {
        console.error('Parametr identifier jest wymagany!');
        return '';
      }
      let wherePart = isString(args.identifier) ?
      `[Username] LIKE '%${args.identifier}%'`:
      `Id = ${args.identifier}`;

      return `select top 1 * from [AppUser] where ${wherePart}`;
    },

    //[AppRole]
    selectRolesByNames: function(args) {
      if(!Array.isArray(args.roleNames)) {
        console.error('Parametr roleNames musi być tablicą string');
        return '';
      }

      const assertUnique = new Set(args.roleNames);
      const roleQueries = [];

      assertUnique.forEach(roleName => {
        roleQueries.push(`SELECT  r.[Id] as 'id', r.[Name] as 'name' FROM [dbo].[AppRole] r WHERE r.[Name] = '${roleName}';`) ;
      });
      return roleQueries.join('\n');
    },
    selectRolesOfUserWithId: function(args) {
      if(!args.userId) {
        console.error('Parametr userId jest wymagany!');
        return '';
      }
      return `SELECT * FROM [dbo].[GetRolesOfUserWithId](${args.userId})`;
    },

    //[Order]
    selectOrderWithId: function(args) {
      if(!args.id){
        console.error('Parametr Id jest wymagany!');
        return '';
      }
      return `EXEC GetOrderDataWithId @orderId=${args.id}`;
    },
    selectOrdersNonArchivized: function(args) {
      return `EXEC GetNonArchivedOrdersData`;
    },
    selectOrdersCount: function(args) {
      if(!args.statusFilters) {
        args.statusFilters = {
          registered: true,
          inProgress: true,
          finished: true
        }
      }
      return `SELECT COUNT (O.Id) AS ordersCount from OrdersRegardingStatuses(
        ${args.statusFilters.registered ? '1' : '0'},
        ${args.statusFilters.inProgress ? '1' : '0'},
        ${args.statusFilters.finished ? '1' : '0'} 
        ) O`;
    },
    selectOrdersForPagedList: function(args) {
      if(!args){
        throw new Error('args param is required!')
      }
      if(!args.statusFilters) {
        args.statusFilters = {
          registered: true,
          inProgress: true,
          finished: true
        }
      }
      args.page = args.page || 0;
      args.itemsOnPage = args.itemsOnPage || 5;
      return `SELECT * FROM GetOrdersForPage(
        ${args.page}, 
        ${args.itemsOnPage},
        ${args.statusFilters.registered ? '1' : '0'},
        ${args.statusFilters.inProgress ? '1' : '0'},
        ${args.statusFilters.finished ? '1' : '0'}   
        );`
    },
    //[Worker]
    selectWorkersOfOrder: function(args) {
      return `
          SELECT
          W.FirstName,
          W.LastName,
          W.PhoneNumber FROM [Worker] W
          INNER JOIN OrderToWorker otw on otw.WorkerId = W.Id and otw.OrderId = @orderId`;
    },

    // [TimeLog]
    selectSpentTimes: function(args) {
      if(!args){
        throw new Error('args param is required!')
      }
      if(!Array.isArray(args.ordersIds)){
        throw new Error(`args.ordersIds param isn't an array!`)
      }
      if(!args.ordersIds.every(n => !isNaN(parseInt(n))) ) {
        throw new Error(`some of passed orders ids are not numbers...`)
      }

      const queryStart = 'SELECT COUNT(tl.[LogTime]) as spentTime, tl.[OrderId] as orderId FROM [dbo].[TimeLog] tl';
      const whereParts = [];
      const queryEnd = 'GROUP BY (tl.[OrderId]);'

      // sample result (when args.ordersIds = [1,3,4,6,7])
      // `SELECT COUNT(tl.[LogTime]) as spentTime, tl.[OrderId] as orderId FROM [dbo].[TimeLog] tl
      // WHERE tl.[OrderId] = 1
      // OR tl.[OrderId] = 3
      // OR tl.[OrderId] = 4
      // OR tl.[OrderId] = 6
      // OR tl.[OrderId] = 7
      // GROUP BY (tl.[OrderId]);`

      args.ordersIds.forEach( (id, index) => {        
        if(index === 0){
          whereParts.push(`WHERE tl.[OrderId] = ${id}`);
        } else {
          whereParts.push(`OR tl.[OrderId] = ${id}`);
        }
      });
      
      return `${queryStart}\n${whereParts.join('\n')} ${queryEnd}`; ;
    }

  }

  //zwraca kwerende SQL zadeklarowaną w parametrze sqlQueries
  this.get = function(queryKey /*string*/, args /* number || string */){
    const target = sqlQueries[queryKey];
    if(!target) {
      console.error(`Brak funkcji zwracającej kwerende SQL o nazwie: ${queryKey}`);
      return null;
    }
    return target(args);
  }
}
module.exports = QueryStore;