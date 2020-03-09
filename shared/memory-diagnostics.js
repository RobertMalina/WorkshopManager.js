const units = {
  kB: 'kB',
  MB: 'MB',
};
Object.freeze(units);

const defPrecision = 2;
let logsCount = 0;

const print = ({ index, rss, heapTotal, heapUsed }) => {
  console.log(
    `Memory usage log:${index}\n rss: ${rss}\n heapTotal: ${heapTotal}\n heapUsed: ${heapUsed}\n`,
  );
};

const transformAll = (
  data,
  targetUnit = units.MB,
  precision = defPrecision,
) => {
  if (!Array.isArray(data)) {
    throw new Error(
      'Data param has to be array of { key <string> and bytesCount <int> }.',
    );
  }
  const result = {};
  for (let pair of data) {
    result[pair.key] = transform(pair.bytesCount, targetUnit, precision);
  }
  return result;
};

const transform = (bytesCount, unit = units.MB, precision = defPrecision) => {
  if (bytesCount == 0) {
    return `$0${unit}`;
  }
  if (!bytesCount) {
    throw new Error('bytesCount is non-numeric value!');
  }
  let result;
  switch (unit) {
    case units.kB:
      result = bytesCount / 1024;
      break;
    case units.kB:
      result = bytesCount / 1024 / 1024;
      break;
    default:
      result = bytesCount / 1024 / 1024;
      break;
  }
  return `${result.toFixed(precision)} ${unit}`;
};

const generateLog = function({ rss, heapTotal, heapUsed }) {
  if (!rss || !heapTotal || !heapUsed) {
    throw new Error(
      `Could not find memory usage data (did you pass process.memoryUsage() result to this method?)`,
    );
  }

  const session = this;

  session.logsCount++;

  return {
    in: function(unit, precision = defPrecision) {
      const result = transformAll(
        [
          { key: 'rss', bytesCount: rss },
          { key: 'heapTotal', bytesCount: heapTotal },
          { key: 'heapUsed', bytesCount: heapUsed },
        ],
        unit,
        precision,
      );
      print({ index: session.logsCount, ...result });
    },
  };
};

const memoryDiagnostics = {
  session: function() {
    this.logsCount = 0;
    return {
      log: generateLog.bind(this),
    };
  },
};

module.exports = {
  units,
  memoryDiagnostics,
};
