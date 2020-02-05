const { reduceObj } = require('../../shared/tools');

describe('reduceObj should return', ()=> {

  const payload = {
    password: 'zaq123wsx',
    username: 'testUser1',
    department: 'Workshop A',
    func1: () => {},
    func2: () => {}
  };

  const transformation = (data, val, key) => {
    if (typeof val !== "function" && key !== "password")
    {
      data[key] = val
    }
    return data;
  }
  const target = {
    username: 'testUser1',
    department: 'Workshop A'
  };

  const received = reduceObj( payload, transformation, {} );

  test('object with properties: username & department', () => {
    expect(received).toEqual(target);
  });
  // test case 2 - test (pojedyńczy test)
  test('object without password property', () => {
    expect(received.password).toBeFalsy();
  });
  
  console.log(received);
  
});