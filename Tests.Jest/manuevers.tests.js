const { applyReduce, isIsogram, findStandOff, persistence } = require('../manuevers.js');
applyReduce();

// przestrzeń 
describe.skip('reduce method should return', ()=> {
  test('5 when [ 1,2,2 ] passed as arg', ()=> {
    expect([ 1,2,2 ]
      .reduceV2( (acc, curr, i) => acc + curr, 0 ) )
      .toEqual(5)
  });
  // test case 2 - test (pojedyńczy test)
  test('Hello World when [ "Hello"," ","World","! ] passed as arg', () => {
    expect([ 'Hello',' ','World','!' ]
      .reduceV2( (acc, curr, i) => acc + curr, '' ) )
      .toEqual('Hello World!')
  });
  // test case 3 -test funkcji mnożącej tablicę INT (pojedyńczy test)
  test('(int[] multiplication) 8 when passed [2,2,2] :  ', ()=> {
    expect([2,2,2]
      .reduceV2( (acc, curr, i) => { return acc * curr }, 1 ) )
      .toEqual(8)
  });
});

describe.skip('isIsogram should return', ()=> {
  test('when "Hvitserk" passed: true', ()=> {
    expect( isIsogram('Hvitserk') )
      .toEqual(true)
  });
  test('when "Reagnar and Lagertha" passed: false', ()=> {
    expect( isIsogram('Reagnar and Lagertha') )
      .toEqual(false)
  });
  test('when "RagnarRok" passed: false', ()=> {
    expect( isIsogram('RagnarRok') )
      .toEqual(false)
  });
  test('when "{} object" passed: null', ()=> {
    expect( isIsogram({}) )
      .toEqual(null)
  });
});

describe.skip('findStandOff should return', ()=> {
  test('when "1 2 1 1 7" passed: 2', ()=> {
    expect( findStandOff('1 2 1 1 7') )
      .toEqual(2)
  });
  test('when "2 2 10 12 18 3 4" passed: 6', ()=> {
    expect( findStandOff('2 2 10 12 18 3 4') )
      .toEqual(6)
  });
  test('when "7 7 7 2 7" passed: 4', ()=> {
    expect( findStandOff('7 7 7 2 7') )
      .toEqual(4)
  });
});

describe.skip('persistence should return', ()=> {
  test('when passed "39": 3', ()=> {
    expect( persistence(39) )
      .toEqual(3)
  });
  test('when passed "999": 4', ()=> {
    expect( persistence(999) )
      .toEqual(4)
  });
  test('when passed "4": 0', ()=> {
    expect( persistence(4) )
      .toEqual(0)
  });
});