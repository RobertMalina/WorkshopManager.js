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

 const asEntites = function (recordset /*odczyt z bazy*/, options) {
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
    return entititesArr;
  }

  module.exports = {
    Entity: Entity,
    asEntites: asEntites
  }