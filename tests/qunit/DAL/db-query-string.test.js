const AppUser = require('../DAL/AuthModels/AppUser');
const SqlQueryParser = require('../DAL/db-query-string');

QUnit.module('mssql-module sql queries parser');

QUnit.test("should return valid sql query for INSERT AppUser entity.", function( assert ) {
  const user = new AppUser();
  const query = new SqlQueryParser().asInsertFor(user);
  const expectedQuery = "INSERT INTO [dbo].[AppUser] ([Username],[PasswordHash]) VALUES (@username,@passwordhash)";
  assert.equal( query, expectedQuery );
});