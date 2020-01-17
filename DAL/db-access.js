const QueryString = require('./db-query-string');

const DbAccess = function() {
  const sql = require('mssql');
  const dbConnectData = require('../server.config');

  //-dev (for development database) || -test (for test database)
  this.target = '-dev';

  sql.on('error', err => {
    console.warn(err);
  })

  const isEntityModelValid = function (entityModel) {   
    if(!entityModel.hasOwnProperty("getModelMap")){
      console.error('Passed object does not implement required features of entityModel ...');
      return false;
    }
    return true;
  }

  this.insert = function(entityModel, schema){
    if(!isEntityModelValid(entityModel)){
      return false;
    }

    const modelMap = entityModel.getModelMap();
    const request = new sql.Request();
    const columnDatas = [];

    for(const key in modelMap){
      let propSettings = modelMap[key];
      if(!propSettings.autoIncrement){
        let argName = key.toLowerCase();
        columnDatas.push({
          argName: argName,
          type: propSettings.type,
          value: propSettings.value
        })
        request.input(argName, propSettings.type, propSettings.value);
      }
    }

    const query = new QueryString().asInsertFor(entityModel);
    this.run(query,columnDatas);
  }

  this.run = function(sqlStatement, columnDatas){
    
    return new Promise(function(resolve, reject) {
      const connSettings = dbConnectData.dbDynamic(this.target || "-dev");
      console.log(connSettings);
      sql.connect(connSettings, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        const request = new sql.Request();

        if(columnDatas){
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