const DbAccess = require('../DAL/db-access');

const OrderService = function() {
  
  const db = new DbAccess();

  const Entity = function(readData, ignoredColumns, kebabCase ){
    
    this.rawData = readData;
    this.ignoredColumns;
    this.kebabCase = kebabCase ? true : false;

    if(!ignoredColumns){
      this.ignoredColumns = [];
    }
    else {
      this.ignoredColumns = ignoredColumns;
      this.ignoredColumns.map((colname)=>{colname.toLowerCase()});
    }

    this.transform = function() {
      for (var prop in this.rawData) {
        if(ignoredColumns.indexOf(prop.toLowerCase()) > -1) {
          continue;
        }

        if (Object.prototype.hasOwnProperty.call(this.rawData, prop)) {

            if(prop.indexOf('.') > -1) {            
              let subEntityName = prop.split('.')[0];
              let subEntityPropName = prop.split('.')[1];
              if(this.kebabCase) {
                subEntityName = subEntityName.charAt(0).toLowerCase() + subEntityName.substring(1);
                subEntityPropName = subEntityPropName.charAt(0).toLowerCase() + subEntityPropName.substring(1);
              }
              this[subEntityName] = this[subEntityName] || {};      
              this[subEntityName][subEntityPropName] = this.rawData[prop];
            }
            else{
              let propName = prop;
              if(this.kebabCase) {
                propName = propName.charAt(0).toLowerCase() + propName.substring(1);
              }
              this[propName] = this.rawData[prop];
            }
        }
      }
      delete this.rawData;
      delete this.kebabCase;
      delete this.transform;
      delete this.ignoredColumns;
    }
  }

  this.fetchActiveOrders = function() {
    return new Promise((resolve, reject)=> {
      db.run(`
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
      (Select C.Id from [Client] C where C.Id = O.ClientId) AS [Client.Id],
      (Select C.FirstName from [Client] C where C.Id = O.ClientId) AS [Client.FirstName],
      (Select C.LastName from [Client] C where C.Id = O.ClientId) AS [Client.LastName],
      (Select C.PhoneNumber from [Client] C where C.Id = O.ClientId) AS [Client.PhoneNumber],
	    W.FirstName AS [Supervisor.FirstName],
      W.LastName AS [Supervisor.LastName],
      W.PhoneNumber AS [Supervisor.PhoneNumber]
	    from [Order] O
	    INNER JOIN [Worker] W on O.SupervisorId = W.Id
	    WHERE O.Archived = 0`)
      .then((response) => {
        
        if(!response.recordset){
          resolve(null);
        }
        else if(response.recordset.length > 0){
          const entities = [];
          for(let i=0; i<response.recordset.length; i++){
            let excludedColumns = ['id','decription'];
            let entity = new Entity(response.recordset[i], excludedColumns, 'kebab-case');
            entity.transform();
            entities.push(entity);
          }
          resolve(entities);
        }
        else {
          resolve(null);
        }
      })
      .catch((error)=> {
        reject(error);
      });
    });
  };
   
  this.fetchOrder = function(id){
    return new Promise((resolve, reject)=> {
      db.run(`
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
      (Select C.Id from [Client] C where C.Id = O.ClientId) AS [Client.Id],
      (Select C.FirstName from [Client] C where C.Id = O.ClientId) AS [Client.FirstName],
      (Select C.LastName from [Client] C where C.Id = O.ClientId) AS [Client.LastName],
      (Select C.PhoneNumber from [Client] C where C.Id = O.ClientId) AS [Client.PhoneNumber],
	    W.FirstName AS [Supervisor.FirstName],
      W.LastName AS [Supervisor.LastName],
      W.PhoneNumber AS [Supervisor.PhoneNumber]
	    from [Order] O
	    INNER JOIN [Worker] W on O.SupervisorId = W.Id
	    WHERE O.Id = ${id}`)
      .then((response) => {
        if(!response.recordset) {
          resolve(null);
        }
        else if(response.recordset.length > 0){
          const entities = [];
          for(let i=0; i<response.recordset.length; i++){
            let excludedColumns = ['id','decription'];
            let entity = new Entity(response.recordset[i], excludedColumns, 'kebab-case');
            entity.transform();
            entities.push(entity);
          }
          resolve(entities);
        }
        else {
          resolve(null);
        }
      })
      .catch((error)=> {
        reject(error);
      });
    });
  };

};

module.exports = OrderService;
