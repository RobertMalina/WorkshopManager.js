const QueryStore = function () {
  const sqlQueries = {
    //[Order]
    selectOrderWithId: function(args) {
      if(!args.id){
        console.error('Parametr Id jest wymagany!');
        return '';
      }
      return `
      SELECT O.Id, 
      O.SupervisorId, 
      O.Title, 
      O.VehicleDescription, 
      O.Description, 
      O.DateRegister, 
      O.DateStart,
      O.DateEnd, 
      O.Cost,
      O.EstimatedTime, 
      O.Status,
      (SELECT C.Id FROM [Client] C where C.Id = O.ClientId) AS [Client.Id],
      (SELECT C.FirstName FROM [Client] C where C.Id = O.ClientId) AS [Client.FirstName],
      (SELECT C.LastName FROM [Client] C where C.Id = O.ClientId) AS [Client.LastName],
      (SELECT C.PhoneNumber FROM [Client] C where C.Id = O.ClientId) AS [Client.PhoneNumber],
	    W.FirstName AS [Supervisor.FirstName],
      W.LastName AS [Supervisor.LastName],
      W.PhoneNumber AS [Supervisor.PhoneNumber]
	    FROM [Order] O
	    INNER JOIN [Worker] W on O.SupervisorId = W.Id
	    WHERE O.Id = ${args.id}`;
    },
    selectOrdersNonArchivized: function(args) {
      return `
      SELECT O.Id, 
      O.SupervisorId, 
      O.Title, 
      O.VehicleDescription, 
      O.Description, 
      O.DateRegister, 
      O.DateStart,
      O.DateEnd, 
      O.Cost, 
      O.EstimatedTime, 
      O.Status,
      (SELECT C.Id FROM [Client] C where C.Id = O.ClientId) AS [Client.Id],
      (SELECT C.FirstName FROM [Client] C where C.Id = O.ClientId) AS [Client.FirstName],
      (SELECT C.LastName FROM [Client] C where C.Id = O.ClientId) AS [Client.LastName],
      (SELECT C.PhoneNumber FROM [Client] C where C.Id = O.ClientId) AS [Client.PhoneNumber],
	    W.FirstName AS [Supervisor.FirstName],
      W.LastName AS [Supervisor.LastName],
      W.PhoneNumber AS [Supervisor.PhoneNumber]
	    FROM [Order] O
	    INNER JOIN [Worker] W on O.SupervisorId = W.Id
	    WHERE O.Archived = 0`;
    },
    selectOrdersCountAll: function(args){
      return 'SELECT COUNT(o.Id) FROM [Order] o';
    },
    selectOrdersCountNonArchivized: function(args){
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