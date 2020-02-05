const applyReduce = function() {
  // weryfikowany fragment (jednostka) kodu
  Array.prototype.reduceV2 = function (func, initialValue) {
    let arrLength = this.length,
     accumulator = initialValue,
     currentValue;
    for(let i = 0; i< arrLength; i++) {
      currentValue = this[i];
      accumulator = func(accumulator, currentValue, i);
    }
    return accumulator;
  }

}









const isIsogram = function(arg){
  if (typeof arg !== 'string'){
    return null;
  }
  let sLenght = arg.length,
    letters = [],
    currChar,
    i;

  arg  = arg.toLowerCase();

  for (i=0; i<sLenght; i++) {
    currChar = arg.charAt(i);
    if (letters.indexOf(currChar) !== -1) {
      return false;
    }
    else {
      letters.push(currChar)
    }
  }
  return true;
}

const findStandOff = function(numbersString){
  const numbers = numbersString.split(" ").map(s => {
    return parseInt(s);
    }), 
    odds = [], 
    evens = [];

    numbers.map( (n,i) => {
      if( n%2 == 0 ){
        evens.push({index: i+1});
      }
      else {
        odds.push({index: i+1});
      }
    });
    return evens.length < odds.length ?
      evens[0].index : 
      odds[0].index;
}

const persistence = function(num) {
  const transform = function(num, count) {
    const num2str = num.toString();
    const nums = num2str
      .split('')
      .map(n => { return parseInt(n); });
    if(nums.length === 1){
      return count;
    }
    const nextOutput = nums.reduce(( acc, next) => acc*next, 1 );
    count = count + 1;
    return transform(nextOutput, count);
  };
  return transform(num,0);
}

function nbYear(p0, percent, aug, p) {
  let years = 0;
  
  percent = percent / 100.0;

  function increaseUntil() {
    if ( p0 >= p ) {
      return;
    }
    else {
      years = years + 1;
      p0 = p0 + Math.floor( p0* percent + aug);
      increaseUntil();
    }
  }
  increaseUntil();
  return years;
}

const canBeATriangle = function(a,b,c){
  Array.prototype.__getWithout = function(index) {
    return this.filter((item, i) => {
        return i !== index;
    });
  }
  return [a,b,c].every((s,i)=>{ 
    return s < [a,b,c].__getWithout(i).reduce((acc,next)=> acc + next); });
}

const MORSE_CODE = {
  '....': 'H',
  '.': 'E',
  '-.--': 'Y',
  '.---': 'J',
  '..-': 'U',
  '-..': 'D'
}

decodeMorse = function(morseCode){
  let codeLength = morseCode.length,
    i,
    morseLetter = null,
    spaceEncountered = false,
    spacesCount = 0,
    decodedStr = '';

  const addSpace = function(){
    decodedStr += ' ';
    spacesCount = 0;
  }
  const addLetter = function(){
    decodedStr += MORSE_CODE[morseLetter];
    morseLetter = null;
  }
  const tryAppend = function (){
    if(morseLetter){
      addLetter();
    }
    else if(spacesCount === 3){
      addSpace();
    }
  }
  
  for(i=0; i<codeLength; i++) {
    spaceEncountered = morseCode.charAt(i) === ' ' ? true : false;

    if(spaceEncountered) {
      spacesCount++;
      tryAppend();
    }
    else {
      spacesCount = 0;
      if(morseLetter) {
        morseLetter += morseCode.charAt(i);
      }
      else {
        morseLetter = morseCode.charAt(i);
      }
    }

    if(i === codeLength-1) {
      tryAppend();
    }
  }
  return decodedStr.trim();
}

decodeMorse = function(morseCode){
  function decodeMorseLetter(letter) {
    return MORSE_CODE[letter];
  }
  function decodeMorseWord(word) {
    return word.split(' ').map(decodeMorseLetter).join('');
  }
  return morseCode.trim().split('   ').map(decodeMorseWord).join(' ');
}


module.exports = {
  applyReduce: applyReduce,
  isIsogram: isIsogram,
  findStandOff: findStandOff,
  persistence: persistence,
  decodeMorse: decodeMorse
}