const QueryStore = require('../../DAL/query-store');
const { AppUserToAppRole, digest } = require('../../DAL/DAL.index');
/*
options: {
  dbAccess: DbAccess
}
*/

const RoleService = function(options /*see above*/) {
  options = options || {};

  if (!options.dbAccess) {
    console.error('RoleService requires DbAccess object');
    return null;
  }

  const { dbAccess } = options;
  const queryStore = new QueryStore();

  const verifyRolenames = (roleNames /*string[]*/) => {
    if (!Array.isArray(roleNames)) {
      console.error('createAppRoles: roleNames must be an string array');
      return null;
    }
    return new Promise((resolve, reject) => {
      const query = queryStore.get('selectRolesByNames', {
        roleNames: roleNames,
      });
      dbAccess
        .run(query)
        .then(response => {
          if (response) {
            resolve(
              digest(response, {
                /* excludedColumns: ['Id','id'],*/ modelsName: 'roles',
              }),
            );
          } else {
            console.error('no roles found for search:', roleNames);
            reject(null);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  this.getRolesOf = (userId /*number*/) => {
    return new Promise((resolve, reject) => {
      dbAccess
        .run(queryStore.get('selectRolesOfUserWithId', { userId: userId }))
        .then(response => {
          if (!response.recordset) {
            reject(`User (id:${userId}) does not have any roles...`);
          } else if (response.recordset.length > 0) {
            const entities = digest(response, {});
            resolve(entities);
          } else {
            resolve(null);
          }
        })
        .catch(error => {
          reject(error);
        });
    });
  };

  this.setRoles = (user /*AppUser*/, roleNames /*{ name }*/) => {
    return new Promise((resolve, reject) => {
      const bindings = [];
      verifyRolenames(roleNames)
        .then(res => {
          if (res.roles.length === 0) {
            reject('no matching roles found in system database...');
          }
          res.roles.forEach(role => {
            bindings.push(
              new AppUserToAppRole({ userId: user.get('Id'), roleId: role.id }),
            );
          });

          if (bindings.length > 1) {
            dbAccess
              .insertMany({ tableName: 'AppUserToAppRole', models: bindings })
              .then(response => resolve(response))
              .catch(err => reject(err));
          } else {
            dbAccess
              .insert(bindings[0])
              .then(response => resolve(response))
              .catch(err => reject(err));
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  };
};

module.exports = RoleService;
