const QueryString = function (dbSchema) {

  this.dbSchema = dbSchema || "dbo";

  const asQueryParams = function (properties) {
    const args = [],
     columns = [];

    let prop, argName;

    for(let key in properties){
      prop = properties[key];
      if(prop.skipInsert) {
        continue;
      }
      argName = key.toLowerCase();
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

  this.asInsertFor = function (model) {
    const tableName = model.constructor.name;
    const params = asQueryParams(model.properties);
    return insertQueryStringFor(this.dbSchema, tableName, params);
  }
};

module.exports = QueryString;