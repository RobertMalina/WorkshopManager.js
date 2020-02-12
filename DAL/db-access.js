const QueryString = require('./db-query-string');
const { isModel } = require('../DAL/DAL.index');

const DbAccess = function() {
  const sql = require('mssql');
  const dbConnectData = require('../server.config');

  //-dev (for development database) || -test (for test database)
  this.target = '-dev';

  sql.on('error', err => {
    console.warn(err);
  })

  const isEntityModelValid = function (entityModel) {   
    if(!entityModel.hasOwnProperty("properties")){
      console.error('Passed object does not implement required features of entityModel ...');
      return false;
    }
    return true;
  }

  /*
const sql = require('mssql');
properties = {
  'IntPropName': {
    type: require('mssql').Int,
    value: 0,
    nullable: false,
    skipInsert: false,
    primary: false
  }
}
*/

/*
const table = new sql.Table('table_name') // or temporary table, e.g. #temptable
table.create = true
table.columns.add('a', sql.Int, {nullable: true, primary: true})
table.columns.add('b', sql.VarChar(50), {nullable: false})
table.rows.add(777, 'test')
 
const request = new sql.Request()
request.bulk(table, (err, result) => {
    // ... error checks
})
*/

  this.insertMany = ({
      tableName /*string*/, 
      models /*Model[] (Model function inheritants) */,
    }) => {

      const bulkInsert = () => {
        return new Promise((resolve, reject) => {
       
          if(models.length === 0){
            reject('models to insert is empty...');        
          }
  
          const model = models[0];
  
          if(!model.insertRowInto) {
            reject('model does not support bulk insert - it does not implement insertRowInto function...');   
          }
  
          let prop;
          const request = new sql.Request();
          const table = new sql.Table(tableName);
  
          Object.keys(model.properties).forEach(key => {
            prop = model.properties[key];
            table.columns.add(
              key, prop.type,
              {
                nullable: prop.nullable ? true : false,
                primary: prop.primary ? true: false
              }
            );
          });
  
          models.forEach(model => {
            model.insertRowInto(table);
          })
  
          request.bulk(table,(err, result) => {
            if(err){
              reject(err);
            } else {
              resolve(result)
            }
          })
        });
      }
    return this.connectAndRun( { asyncAction: bulkInsert })
  }

  this.insert = function(model){

    return new Promise((resolve, reject) => {
      if (!isModel(model)) {
        reject('inserted object must inherits from Model function...');
      }
  
      const properties = model.properties,
        request = new sql.Request(),
        columnDatas = [];
  
      for(const key in properties){
        let propSettings = properties[key];
        if(!propSettings.skipInsert) {
          let argName = key.toLowerCase();
          columnDatas.push({
            argName: argName,
            type: propSettings.type,
            value: propSettings.value
          });        
          request.input(argName, propSettings.type, propSettings.value);
        }
      }
  
      const query = new QueryString().asInsertFor(model);

      this.run(query,columnDatas).then( (res)=> {
        resolve({
          dbResponse: res,
          model: model
        });
      })
      .catch(err => {
        reject(err);
      });

    });
  }

  this.connectAndRun = ({asyncAction}) => {
    return new Promise((resolve, reject) => {
      const connSettings = dbConnectData.dbDynamic(this.target || "-dev");
      sql.connect(connSettings, err => {
        if(err){
          console.error('db-connection error', err);
          reject(err);
        }
        asyncAction()
        .then( result => resolve(result))
        .catch( err => reject(err));
      })
    })
  }

  this.run = function(sqlStatement, columnDatas) {
    
    return new Promise(function(resolve, reject) {
      const connSettings = dbConnectData.dbDynamic(this.target || "-dev");
      sql.connect(connSettings, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        const request = new sql.Request();

        if(columnDatas) {
          for(let i = 0; i < columnDatas.length; i++ ){
            let columnData = columnDatas[i];
            request.input(columnData.argName, columnData.type, columnData.value );
          }
        }

        request.query(sqlStatement, function(err, recordset) {
          if (err) {
            console.log(err);
            reject(err);
            sql.close()
          }
          sql.close();
          resolve(recordset);
        });
      });
    });
  }
};

module.exports = DbAccess;