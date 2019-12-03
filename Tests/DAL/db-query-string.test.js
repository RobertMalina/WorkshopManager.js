const QueryString = require('../../DAL/db-query-string');

test('EntityModel should return false if property name is not valid.',()=>{
  const AppUser = require('../../DAL/AuthModels/AppUser');
  const user = new AppUser();
  const result = user.set("WrongProperty",32);
  expect(result).toBe(false);
});

test('Should return valid sql-query-string for INSERT AppUser entity.', () => {
  const AppUser = require('../../DAL/AuthModels/AppUser');
  const user = new AppUser();
  user.set('Username','George Patton');
  user.set('PasswordHash','2d928568ce17d1485f6d2c48bce9af5648c59dea');
  const queryString = new QueryString().asInsertFor(user);
  expect(queryString).toBe(`INSERT INTO [dbo].[AppUser] ([Username],[PasswordHash]) VALUES (@username,@passwordhash)`);
});