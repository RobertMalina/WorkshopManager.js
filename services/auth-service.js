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

};

module.exports = AuthService;