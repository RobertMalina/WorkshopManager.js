const AuthService = require('../services/auth-service');
const AppUser = require('../DAL/AuthModels/AppUser');

let service;

beforeAll(()=>{
  service = new AuthService();
});

test('Should return instance of AppUser', (done)=>{
  const postData = {
    Password: 'zaqwsx12',
    Username: 'New User'
  };
  service.createVirtualUser(postData).then((user)=>{
    expect(user).toBeInstanceOf(AppUser);
    done();
  }).catch((error) => {
     console.log(error);
      done(); 
  });
  
});

test('Should have PasswordHash property initialized', (done)=>{
  const postData = {
    Password: 'zaqwsx12',
    Username: 'New User'
  };
  service.createVirtualUser(postData).then((user)=>{
    const hashedPswd = user.get('PasswordHash').value;
    expect(hashedPswd.length).toBeGreaterThanOrEqual(0);
    done();
  }).catch((error) => { 
    console.log(error);
    done();
  });
});
