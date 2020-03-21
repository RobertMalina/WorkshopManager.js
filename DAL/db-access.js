const QueryString = require('./db-query-string');
const { isModel } = require('../DAL/DAL.index');
const sql = require('mssql');

class DbAccess {
  constructor(connectionSettings) {
    this.settings = connectionSettings;
    this.target = '-dev'; //-dev (for development database) || -test (for test database)
    sql.on('error', err => {
      console.warn(err);
    });
  }

  insertMany({
    tableName /*string*/,
    models /*Model[] (Model function inheritants) */,
  }) {
    const bulkInsert = () => {
      return new Promise((resolve, reject) => {
        if (models.length === 0) {
          reject('models to insert is empty...');
        }

        const model = models[0];

        if (!model.insertRowInto) {
          reject(
            'model does not support bulk insert - it does not implement insertRowInto function...',
          );
        }

        let prop;
        const request = new sql.Request();
        const table = new sql.Table(tableName);

        Object.keys(model.properties).forEach(key => {
          prop = model.properties[key];
          table.columns.add(key, prop.type, {
            nullable: prop.nullable ? true : false,
            primary: prop.primary ? true : false,
          });
        });

        models.forEach(model => {
          model.insertRowInto(table);
        });

        request.bulk(table, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      });
    };
    return this.connectAndRun({ asyncAction: bulkInsert });
  }

  insert(model) {
    return new Promise((resolve, reject) => {
      if (!isModel(model)) {
        reject('inserted object must inherits from Model function...');
      }

      const properties = model.properties,
        request = new sql.Request(),
        columnDatas = [];

      for (const key in properties) {
        let propSettings = properties[key];
        if (!propSettings.skipInsert) {
          let argName = key.toLowerCase();
          columnDatas.push({
            argName: argName,
            type: propSettings.type,
            value: propSettings.value,
          });
          request.input(argName, propSettings.type, propSettings.value);
        }
      }

      const query = new QueryString().asInsertFor(model);

      this.run(query, columnDatas)
        .then(res => {
          resolve({
            dbResponse: res,
            model: model,
          });
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  connectAndRun({ asyncAction }) {
    return new Promise((resolve, reject) => {
      sql.connect(this.settings, err => {
        if (err) {
          console.error('db-connection error', err);
          reject(err);
        }
        asyncAction()
          .then(result => resolve(result))
          .catch(err => reject(err));
      });
    });
  }

  run(sqlStatement, columnDatas) {
    return new Promise((resolve, reject) => {
      sql.connect(this.settings, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        const request = new sql.Request();

        if (columnDatas) {
          for (let i = 0; i < columnDatas.length; i++) {
            let columnData = columnDatas[i];
            request.input(
              columnData.argName,
              columnData.type,
              columnData.value,
            );
          }
        }

        request.query(sqlStatement, function(err, recordset) {
          if (err) {
            console.error('Error log (own):', err);
            reject(err);
            //sql.close();
          }
          //sql.close();
          resolve(recordset);
        });
      });
    });
  }
}

module.exports = DbAccess;
