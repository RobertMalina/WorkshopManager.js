const fs = require('fs');

export const getTestData = fileName => {
  const rawdata = fs.readFileSync(fileName);
  const data = JSON.parse(rawdata);
  return data;
};
