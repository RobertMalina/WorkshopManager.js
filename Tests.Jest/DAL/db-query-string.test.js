const AppUser = require('../../DAL/AuthModels/AppUser');
const Sql  = require('mssql');
const QueryString = require('../../DAL/db-query-string');

let user;

beforeAll(()=>{

});

beforeEach(()=>{
  user = new AppUser();
});

describe('AppUser EntityModel tests',()=>{

  test('EntityModel should return false if property name is not valid.',()=>{  
    const result = user.set("WrongProperty",32);
    expect(result).toBe(false);
  });
  
  test('EntityModel set method works correctly.',()=> {
    user.set('Username','George Patton');
    user.set('PasswordHash','2d928568ce17d1485f6d2c48bce9af5648c59dea');
    user.set('NotExistingProp', Date.now );
    const properties = user.getModelMap();
    expect(properties).toEqual({
      'Id':{
        type: Sql.BigInt,
        value: '',
        autoIncrement: true
      },
      'Username':{
        type: Sql.NVarChar(128),
        value: 'George Patton'
      },
      'PasswordHash':{
        type: Sql.NVarChar(64),
        value: '2d928568ce17d1485f6d2c48bce9af5648c59dea'
      }
    });
  });
});

describe('mssql-module insert-query parser tests', ()=> {
  
  let query;

  beforeEach(()=>{
    query = new QueryString().asInsertFor(user);
  });

  test('Should return valid sql-query-string for INSERT AppUser entity.', () => {
    expect(query).toBe(`INSERT INTO [dbo].[AppUser] ([Username],[PasswordHash]) VALUES (@username,@passwordhash)`);
  });

  test('Should contain correct table name', ()=>{
    expect(query).toMatch(/AppUser/);
  });

});

