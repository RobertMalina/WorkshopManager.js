const fs = require('fs');

const getTestData = fileName => {
  const rawdata = fs.readFileSync(fileName);
  const data = JSON.parse(rawdata);
  return data;
};

module.exports = getTestData;
