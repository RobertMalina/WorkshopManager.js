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
    selectOrdersCountAll: function(args) {
      return 'SELECT COUNT(o.Id) FROM [Order] o';
    },
    selectOrdersCountNonArchivized: function(args) {
      return 'SELECT COUNT(o.Id) FROM [Order] o WHERE o.Archived = 0';
    },
    selectOrdersForPagedList: function(args) {
      args.page = args.page || 0;
      args.itemsOnPage = args.itemsOnPage || 5;
      return `SELECT * FROM GetOrdersForPage( ${args.page}, ${args.itemsOnPage}, ${args.archivedToo ? '1' : '0'});`
    },
    //[Worker]
    selectWorkersOfOrder: function(args) {
      return `
          SELECT
          W.FirstName,
          W.LastName,
          W.PhoneNumber FROM [Worker] W
          INNER JOIN OrderToWorker otw on otw.WorkerId = W.Id and otw.OrderId = @orderId`;
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