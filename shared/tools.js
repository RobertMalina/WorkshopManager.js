const reduceObj = function( obj, transformation, initial) {
  let resObj = initial || {};
  for (let key in obj){
    if(obj.hasOwnProperty(key)){
      resObj = transformation(resObj, obj[key], key );
    }
 }
 return resObj;
}
module.exports = {
  reduceObj: reduceObj
}