const DbAccess = require('../DAL/db-access');
const QueryStore = require('../DAL/query-store');

const OrderService = function() {
  
  const db = new DbAccess();
  const queryStore = new QueryStore();

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
      db.run(queryStore.get('selectOrdersNonArchivized'))
      .then((response) => {
        
        if(!response.recordset){
          resolve(null);
        }
        else if(response.recordset.length > 0){
          const entities = this.asEntites(response.recordset, 
            { 
              excludedColumns: ['description']
            });
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

  this.fetchOrdersForPage = function( page, itemsOnPage, archivedToo ) {
    let query = queryStore.get('selectOrdersForPagedList', {
      page: page,
      itemsOnPage: itemsOnPage,
      archivedToo: archivedToo
    });
    return new Promise((resolve, reject) => {
      db.run(query).then((response) => {
        resolve({
          orders: response.recordset
        });
      }).catch(err => {
        reject(err);
      });
    });
  }

  this.getOrdersCount = function(archivedToo){
    let query = '';
    if(archivedToo){
      query = queryStore.get('selectOrdersCountAll');
    }
    else {
      query = queryStore.get('selectOrdersCountNonArchivized');
    }
    return new Promise((resolve, reject) => {
      db.run(query).then((response) => {
        resolve({
          ordersCount: response.recordset[0][""]
        });
      }).catch(err => {
        reject(err);
      });
    });
  }

  this.asEntites = function (recordset /*odczyt z bazy*/, options) {
    if(!recordset) {
      console.error('Parametr recordset musi mieć wartość...');
      return [];
    }
    options = options || {};
    if(!options.excludedColumns) {
      options.excludedColumns = [];
    }

    const entititesArr = [];

    recordset.map((record) => {
      let entity = new Entity(record, options.excludedColumns, 'kebab-case');
      entity.transform();
      entititesArr.push(entity);
    });

    console.log(`entities: ${entititesArr}`);
    return entititesArr;
  }
   
  this.fetchOrder = function(id){
    return new Promise((resolve, reject)=> {
      db.run(queryStore.get('selectOrderWithId', { id:id }))
      .then((response) => {
        if(!response.recordset) {
          resolve(null);
        }
        else if(response.recordset.length > 0){        
          const entities = this.asEntites(response.recordset, 
            { 
              excludedColumns: ['id','decription']
            });
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
