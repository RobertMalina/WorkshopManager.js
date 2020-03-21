export const defResponse = {
  rowsAffected: 1,
  recordset: [
    {
      DbColumnA: 100,
      DbColumnB: 'TextValue',
    },
  ],
};

export const runMock = jest.fn(() => {
  return new Promise(function(resolve, reject) {
    resolve(defResponse);
  });
});
export const insertManyMock = jest.fn(() => {
  return new Promise(function(resolve, reject) {
    resolve(defResponse);
  });
});

const dbAccessMock = jest.fn().mockImplementation(() => {
  return {
    run: runMock,
    insertMany: insertManyMock,
  };
});

export default dbAccessMock;
