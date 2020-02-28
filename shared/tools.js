const reduceObj = (obj, transformation, initial) => {
  if (typeof transformation !== 'function')
    new Error('reduceObj: transformation function is not provided...');
  let resObj = initial || {};
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      resObj = transformation(resObj, obj[key], key);
    }
  }
  return resObj;
};

const isString = val => typeof val === 'string' || val instanceof String;

const typeCheck = (variable, type) => {
  type = type || requiredArg('type');
  if (!variable) return false;
  return variable instanceof type;
};

const requiredArg = argName =>
  new Error(`required argument ${argName || ''} is omitted`);

function invariant(key, action) {
  if (key[0] === '_') {
    throw new Error(`Invalid attempt to ${action} private "${key}" property`);
  }
}

module.exports = {
  reduceObj: reduceObj,
  isString: isString,
  typeCheck: typeCheck,
  invariant: invariant,
};
