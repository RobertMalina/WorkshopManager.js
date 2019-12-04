beforeAll(()=>{
  const AppUser = require('../../DAL/AuthModels/AppUser');
})

describe('AppUser EntityModel tests',()=>{

  let AppUser, sql;
  let user;

  beforeAll(()=>{
    sql = require('mssql');
    AppUser = require('../../DAL/AuthModels/AppUser');
  });
  
  beforeEach(()=>{
    user = new AppUser();
  });

  test('EntityModel should return false if property name is not valid.',()=>{  
    const result = user.set("WrongProperty",32);
    expect(result).toBe(false);
  });
  
  test('EntityModel set method works correctly.',()=> {
    user.set("Username","Jan Kowalski");
    const properties = user.getModelMap();
    expect(properties).toEqual({
      'Id':{
        type: sql.BigInt,
        value: '',
        autoIncrement: true
      },
      'Username':{
        type: sql.NVarChar(128),
        value: 'Jan Kowalski'
      },
      'PasswordHash':{
        type: sql.NVarChar(64),
        value: ''
      }
    });
  });
});

describe('mssql-module query parser tests', ()=> {
  
  let QueryString, AppUser;

  beforeAll(()=>{
    QueryString = require('../../DAL/db-query-string');
    AppUser = require('../../DAL/AuthModels/AppUser');
  });

  test('Should return valid sql-query-string for INSERT AppUser entity.', () => {
    const user = new AppUser();
    user.set('Username','George Patton');
    user.set('PasswordHash','2d928568ce17d1485f6d2c48bce9af5648c59dea');
    const queryString = new QueryString().asInsertFor(user);
    expect(queryString).toBe(`INSERT INTO [dbo].[AppUser] ([Username],[PasswordHash]) VALUES (@username,@passwordhash)`);
  });
});

