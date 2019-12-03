const QueryString = function (dbSchema) {

  this.dbSchema = dbSchema || "dbo";

  const getModelParams = function (modelMap) {
    const args = [];
    const columns = [];
    for(let key in modelMap){
      let propSettings = modelMap[key];
      if(propSettings.autoIncrement){
        continue;
      }
      let argName = key.toLowerCase();
      columns.push(key);
      args.push(`@${argName}`);
    }
    return {
      columns: columns,
      args: args
    }
  }

  const insertQueryStringFor = function(dbSchema, tableName, params){
    const args = params.args;
    const columns = params.columns;
    let insertQuery = `INSERT INTO [${dbSchema}].[${tableName}]`;
    let columnsPart =' (',
      valuesPart = ' VALUES (';

    for(let i = 0; i < columns.length; i++){
      columnsPart += `[${columns[i]}]`;
      valuesPart += args[i];

      if(i === columns.length - 1){
        columnsPart += ')';
        valuesPart += ')';
      }
      else{
        columnsPart += ',';
        valuesPart += ',';
      }
    }
    insertQuery += `${columnsPart}${valuesPart}`;
    return insertQuery;
  }

  this.asInsertFor = function (entityModel) {
    const modelMap = entityModel.getModelMap();
    const tableName = entityModel.constructor.name;
    const params = getModelParams(modelMap);
    return insertQueryStringFor(this.dbSchema, tableName, params);
  }
};

module.exports = QueryString;