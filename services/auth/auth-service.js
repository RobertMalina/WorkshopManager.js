const DbAccess = require('../../DAL/db-access');
const BCrypt = require('bcrypt');
const { AuthProvider, PassportLocalAuthProvider, JWTAuthProvider } = require('./providers/providers.index');
const { isString } = require('../../shared/tools');
const AppUser = require('../../DAL/AuthModels/AppUser');
const AppServer = require('../../server');
const QueryStore = require('../../DAL/query-store');
const { flatten, asModel } = require('../../DAL/Models/entity');
const RoleService  = require('../auth/role-service');

const AuthService = function() {
  
  const db = new DbAccess();

  const roleService = new RoleService({
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
          /*
            register new provider here
          */
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

    getUser: function(/*id or username*/identifier, withRoles = false) /*: Promise<AppUser?> */ {    
     return new Promise((resolve, reject) => {
      const query = queryStore.get('selectAppUser', { identifier: identifier });
       db.run(query)
       .then( read => {
          if(!read.recordset.length < 1) {
            const user = asModel( { dbRead:read, modelType: AppUser });
            
            if( withRoles ) {
              roleService.getRolesOf(user.get('Id'))
              .then(roles => {
                if(roles) {
                  user.set('Roles', roles.map(r => r.roleName));
                  resolve(user);
                } else {
                  reject(`can not fetch roles o user with id:${user.get('Id')}`)
                }
              }).catch(err => { reject(err)});
              
            } else {
              resolve(user);
            }
         }
         else {
            console.error(`user with username: ${identifier}, could not be found...`);      
            resolve(null);
         }
       }).catch(err => { reject(err)});    
     });
    },

    createAppUserInstance: function ( userData = { password, username, roles })/*: Promise<AppUser?> */{
      return new Promise((resolve, reject) => 
      {
        const user = new AppUser();
        if(!user.canAccept(userData))
        {
          reject('passed data body does not conform to AppUser model...');
        }
        
        BCrypt.genSalt(this.saltingRounds)
        .then(salt => BCrypt.hash(userData.password, salt))
        .then( hashedPswd => 
          {
            userData.passwordHash = hashedPswd;
            user.mapProperties(userData);
            resolve(user);
          })
        .catch((err) => reject(err));
      });   
    },

    register: function(userData = { username, password, roles }
    )  /*: Promise<Any> */ {
      return new Promise((resolve, reject) => {
        this.createAppUserInstance(userData)
        .then( userModel =>  db.insert(userModel))
        .then( insertResult => this.getUser(insertResult.model.get('Username')))
        .then( user => roleService.setRoles(user, userData.roles))
        .then( userWithRoles => resolve(userWithRoles))
        .catch( err => reject(err));
      })
    },

    checkCredentials: function(username, password) {  /*: Promise<{ user: AppUser, result: boolean, isError?: boolean}> */ 
    return new Promise((resolve, reject) => {
        let fetchedUser;
        this.getUser(username, true)
        .then( user  => {  
          if(!user) { 
            resolve({});
          }
          fetchedUser = user;
          return BCrypt.compare(password, user.get('PasswordHash'))          
        })
        .then( result =>  resolve({ user: fetchedUser, result: result }))
        .catch( err => reject(err)) 
      });
    }
  };
};

module.exports = AuthService;