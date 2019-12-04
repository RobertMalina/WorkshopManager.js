const DbAccess = require('../DAL/db-access');
const Passport = require('passport');
const BCrypt = require('bcrypt');
const AppUser = require('../DAL/AuthModels/AppUser');

const AuthService = function() {
  
  const db = new DbAccess();

  const saltingRounds = 12;

  this.secure = function(server){
    server.use(Passport.initialize());
    server.use(Passport.session());
  };

  this.createVirtualUser = function(userData){   
    const user = new AppUser();
    if(!user.isValid(userData))
    {
      console.error('Post body does not confrom to registration model...');
      return null;
    }

    return new Promise((resolve, reject) => {
      BCrypt.genSalt(saltingRounds).then((salt) => {
        BCrypt.hash(userData.Password, salt).then((passwordHash)=>{
          user.set('Username', userData.Username);
          user.set('PasswordHash', passwordHash);
          resolve(user);
        }).catch((err) => reject(err));
      })
      .catch((err) => reject(err));
    });  
  };

  this.registerAppUser = function(userData) {
    return this.createVirtualUser(userData).then((appUser)=>{
      return db.insert(appUser);
    }).catch((err) => { console.error(err); });
  };

  this.getAppUser = function(username){
    return new Promise((resolve, reject) => {
      db.run(`select top 1 * from [AppUser] where Username = '${username}'`)
      .then((read) => {
        if(read.recordset.length < 1){
          return null;
        }
        else{
          const user = new AppUser();
          user.set('Id', read.recordset[0].Id);
          user.set('Username', read.recordset[0].Username);
          user.set('PasswordHash',read.recordset[0].PasswordHash);
          resolve(user);
        }
      });    
    });
  };

  this.isLoginDataValid = function(username, password){
    return this.getAppUser(username).then((user)=>{
      if(!user){
        console.warn(`user with username: ${user} not found`)
        return false;
      }
      return BCrypt.compare(password, user.get('PasswordHash'));
    })
  };

};

module.exports = AuthService;