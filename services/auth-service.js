const DbAccess = require('../DAL/db-access');
const passport = require('passport');

const AuthService = function() {
  
  const db = new DbAccess();

  this.secure = function(server){
    server.use(passport.initialize());
    server.use(passport.session());
  }

  this.registerAppUser = function() {
    return db.run('select * from [Order]')
      .catch((error)=> {
        console.error(error);
      });
  };

};

module.exports = AuthService;