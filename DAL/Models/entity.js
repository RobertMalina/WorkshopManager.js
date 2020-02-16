  const { isModel } = require('../Models/model');
  
  const Entity = function(readData, ignoredColumns, kebabCase ) {
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
            } else {
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

  const hoistFromMultiSelect = (recordsets /*: [ [ [Object] ], [ [Object] ] ] */) => {
    const records = [];
    recordsets.forEach(recordSet => {
      records.push(recordSet[0]);
    });
    return records;
  }

  const asModel = ({ dbRead, modelType, modelsName, excludedColumns }) => {
    if(isModel(new modelType())) {
      const flattened = flatten(dbRead, { 
        excludedColumns: excludedColumns
      });
      const models = [];
      let model;
      flattened.forEach( data => {
        model = new modelType();
        model.mapProperties(data);
        models.push(model);
      })

      return models.length < 2 ?
        models[0]:
        models;
    }
    return null;
  }

  const flatten = function (dbResponse /*odczyt z bazy*/, options) {

    // a) if rowsAffected contains array of N int's => take recordsets.forEach(a[] => acc.push(a[0])) as records
    // b) if rowsAffected contains one int, (like: rowsAffected: [ 5 ]) => take recordset as "records:
    // case a) when query includes paralell select's (NOT NESTED)
    // case b) when single query (might contain many nested selects though)
    
    const records = dbResponse.rowsAffected.length > 1 ?
      hoistFromMultiSelect(dbResponse.recordsets) :
      dbResponse.recordset;
      
    if(!records) {
      console.error('Bad read. Parameter "records" has no value...');
      return [];
    }

    options = options || {};
    
    if(!options.excludedColumns) {
      options.excludedColumns = [];
    }

    const entities = [];

    records.map((record) => {
      let entity = new Entity(record, options.excludedColumns, 'kebab-case');
      entity.transform();
      entities.push(entity);
    });

    let response = {};

    options.modelsName ? 
      response[options.modelsName] = entities :
      response = entities;

    if(options.asSingleResult){
      return response[0];
    } else {
      return response;
    }   
  }

  module.exports = {
    Entity: Entity,
    flatten: flatten,
    asModel: asModel
  }