const QueryStore = require('../../DAL/query-store');
const { asEntites } = require('../../DAL/Models/entity');

/*
options: {
  dbAccess: DbAccess
}
*/

const RoleService = function(options /*see above*/) {

  options = options || {};

  if(!options.dbAccess){
    console.error('RoleService requires DbAccess object');
    return null;
  }

  const { dbAccess } = options;
  const queryStore = new QueryStore();

  this.verifyRolenames = (roleNames /*string[]*/) => {
    if(!Array.isArray(roleNames)){
      console.error('createAppRoles: roleNames must be an string array');     
      return null;
    }
    return new Promise((resolve, reject) => {
      const query = queryStore.get(
        'selectRolesByNames', { roleNames: roleNames });
      dbAccess.run(query)
        .then((response) => {
          if(response) { resolve(asEntites(response),{ modelsName: 'roles'}); }
          else {
            console.error('no roles found for search:', roleNames);
            reject(null);
          }
        }).catch((error) => {
          reject(error);
        });
    });
  }

  this.getRolesOf = (userId /*number*/) => {
    return new Promise((resolve, reject) => {
      dbAccess.run(queryStore.get(
        'selectRolesOfUserWithId', { userId: userId }))
        .then((response) => {   
          if(!response.recordset){
            reject(`User (id:${userId}) does not have any roles...`);
          }
          else if(response.recordset.length > 0){
            const entities = asEntites(response,{});
            resolve(entities);
          }
          else {
            resolve(null);
          }
      })
      .catch((error) => {
        reject(error);
      });
    });
  }
};

module.exports = RoleService;
