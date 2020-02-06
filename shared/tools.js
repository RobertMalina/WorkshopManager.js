const reduceObj = ( obj, transformation, initial) => {
  let resObj = initial || {};
  for (let key in obj){
    if(obj.hasOwnProperty(key)){
      resObj = transformation(resObj, obj[key], key );
    }
 }
 return resObj;
}

const isString = (val) => {
  return typeof val === 'string';
};

const typeCheck = (variable, type) => {
  if(!variable){
    return false;
  }
  return variable instanceof type;
};

module.exports = {
  reduceObj: reduceObj,
  isString: isString,
  typeCheck: typeCheck
}