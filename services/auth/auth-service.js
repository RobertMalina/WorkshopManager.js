const DbAccess = require('../../DAL/db-access');
const BCrypt = require('bcrypt');
const { AuthProvider, PassportLocalAuthProvider, JWTAuthProvider } = require('./providers/providers.index');
const { isString } = require('../../shared/tools');
const AppUser = require('../../DAL/AuthModels/AppUser');
const AppServer = require('../../server');
const QueryStore = require('../../DAL/query-store');
const { asEntites } = require('../../DAL/Models/entity');
const RoleService  = require('../auth/role-service');

const AuthService = function() {
  
  const db = new DbAccess();

  this.roleService = new RoleService({
    dbAccess: db
  });

  const queryStore = new QueryStore();

  let authProvider = null;

  this.authProvider = function() {
    return authProvider || new AuthProvider({
      forceGeneric: true
    });
  }

  this.setAuthentication = (config /*
    { target: AppServer,
      provider: string
    }
    */) => {   
      
      //if(config.target instanceof AppServer) { // TODO - weryfikacja dlaczego AppServer to {} i występuje błąd: TypeError: Right-hand side of 'instanceof' is not callable
      if(config.target) {
        switch (config.provider) {
          case 'passport-local':
            authProvider = new PassportLocalAuthProvider();           
            break;
          case 'JWT':
            authProvider = new JWTAuthProvider({maxAge: 3600});
            break;    
          default:
            console.error(`Authorization provider ${config.provider} is not registered in AuthService.setAuthentication method...`);         
            return false;
        }
        authProvider.activateOn(config.target);
      }
      else{
        console.error('target object has invalid type or not provided...');
        return false;
      }
  };



  this.usersSystemApi = {

    saltingRounds: 12,

    get: function(/*id or username*/identifier) /*: Promise<AppUser?> */ {
      let wherePart = isString(identifier) ?
      `[Username] LIKE '%${identifier}%'`:
      `Id = ${identifier}`
 
      const query = `select top 1 * from [AppUser] where ${wherePart}`;
      
     return new Promise((resolve, reject) => {
       db.run(query)
       .then((read) => {
          if(!read.recordset.length < 1) { 
            const user = new AppUser();
            user.set('Id', read.recordset[0].Id);
            user.set('Username', read.recordset[0].Username);
            user.set('PasswordHash', read.recordset[0].PasswordHash);

            this.roleService.getRolesOf(user.get('Id'))
            .then(roles => {
              if(roles) {
                const roleNames = roles.map(r => r.roleName);
                user.set('Roles', roleNames);
                resolve(user);
              } else {
                reject('error during roles fetching')
              }
            }).catch(err => { reject(err)}); 

         }
         else {
            resolve(null);
         }
       })
       .catch(err => { reject(err)});    
     });
    },

    createAppUserInstance: function (
      userData
      /* { username: string, password: string, roles: string[] }*/ 
      )/*: Promise<AppUser?> */{
      const user = new AppUser();
      if(!user.canAccept(userData))
      {
        console.error('Post body does not conform to registration model...');
        return null;
      }
      const { username, password, roles } = userData;
      return new Promise((resolve, reject) => {     
        BCrypt.genSalt(this.saltingRounds).then((salt) => {
          BCrypt.hash(password, salt).then((passwordHash)=>{
            user.set('Username', username);
            user.set('PasswordHash', passwordHash);         
            resolve(user);
          }).catch((err) => reject(err));
        })
        .catch((err) => reject(err));
      }); 
    },

    register: function(userData
    /* { username: string, password: string, roles: string[] }*/ 
    )  /*: Promise<Any> */ {
      return this.createAppUserInstance(userData)
      .then((appUser) => {
        return db.insert(appUser);
      }).catch((err) => { console.error(err); });
    },

    checkCredentials: function(username, password) {  /*: Promise<{ user: AppUser, result: boolean, isError?: boolean}> */ 
      return this.get(username).then((user) => {
        if(!user) {
          return {
            user: null,
            result: false
          };
        }
        return new Promise((resolve, reject) => {
          BCrypt.compare(password, user.get('PasswordHash'))
          .then((result) => {
                resolve({
                  user: user,
                  result: result
                });
            }
          ).catch( err => {
            console.error(err);
            reject({
              user: user,
              result: false,
              isError: true
            });
          });
        });
        //return BCrypt.compare(password, user.get('PasswordHash'));
      });
    }

  };
};

module.exports = AuthService;