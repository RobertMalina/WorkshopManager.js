
// properties example:
/*
const sql = require('mssql');
properties = {
  'IntPropName': {
    type: require('mssql').Int,
    value: 0,
    nullable: false,
    skipInsert: false,
    autoIncrement: false
  }
}
*/

const Model = function(properties /* look above */) {

  this.properties = properties;
  
  const getRequired = () => {
    const requiredProperties = {};
    Object.keys(this.properties)
    .filter(key => {
      return !this.properties[key].autoIncrement;
    })
    .forEach(
      key => {
        if(!this.properties[key].nullable) {
          requiredProperties[key.toLowerCase()] = this.properties[key];
        }
      }
    );
    return requiredProperties;
  }
  this.getRequired = getRequired;

  const canAccept = (formData) => {

    const required = this.getRequired();

    /*fKey: form-data prop key */
    for (let fKey in formData) {
      fKey = fKey.toLowerCase();
      if (Object.prototype.hasOwnProperty.call(required, fKey)) {
        required[fKey].supplied = true;
      }
    }

    const missingProperties = Object.keys(required).filter(key=> {
      return !required[key].supplied;
    });

    return missingProperties.length === 0 ? 
    { yes: true } : { yes: false, missingProperties: missingProperties };
  }
  this.canAccept = canAccept;

  const getMatchingKey = (formPropKey) => {
    return Object.keys(this.properties).find(key => {
      return key.toLowerCase() === formPropKey.toLowerCase();
    });
  }
  this.getMatchingKey = getMatchingKey;

  this.mapProperties = (formData) => {
    const isFormValid = this.canAccept(formData);
    if(isFormValid.yes){
      const fdataKeys = Object.keys(formData);
      let modelPropKey;
      fdataKeys.forEach((key) => {
        modelPropKey = getMatchingKey(key);
        if(modelPropKey) {
          this.set(modelPropKey, formData[key]);
        } else {
          console.error('unable to match form-data to model property', {key:key })
        }
      });
    }
    else {
      console.error('form data can not be assigned to model', isFormValid.missingProperties )
    }
  }

  this.set = (propName, propValue) => {
    if(!this.properties.hasOwnProperty(propName)){
      console.error(`Invalid property name ${propName}`);
      return false;
    }
    const property = this.properties[propName];

    if(Array.isArray(property.value) && !Array.isArray(propValue)){
      console.error(`Invalid property type - should be array... (is: ${typeof propValue})`);
      return false;
    }
    
    property.value = propValue;    
    return true;
  }
  
  this.get = (propName) => {
    if(!this.properties.hasOwnProperty(propName)){
      console.error(`Invalid property name ${propName}`);
      return false;
    }
    let val = this.properties[propName].value;
    return val ? val : 'null';
  }
}

module.exports = Model;