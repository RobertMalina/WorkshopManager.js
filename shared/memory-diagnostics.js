const units = {
  kB: 'kB',
  MB: 'MB',
};
Object.freeze(units);

const defPrecision = 2;
let logsCount = 0;

const print = ({ index, precision, rss, heapTotal, heapUsed }) => {
  //result.toFixed(precision)

  console.log(
    `Memory usage log:${index}\n rss: ${rss.toFixed(
      precision,
    )}\n heapTotal: ${heapTotal.toFixed(
      precision,
    )}\n heapUsed: ${heapUsed.toFixed(precision)}\n`,
  );
};

const transformAll = (data, targetUnit = units.MB) => {
  if (!Array.isArray(data)) {
    throw new Error(
      'Data param has to be array of { key <string> and bytesCount <int> }.',
    );
  }
  const result = {};
  for (let pair of data) {
    result[pair.key] = transform(pair.bytesCount, targetUnit);
  }
  return result;
};

const transform = (bytesCount, unit = units.MB) => {
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
  return result;
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
    in: function(unit, precision = defPrecision, verbose = false) {
      const reads = transformAll(
        [
          { key: 'rss', bytesCount: rss },
          { key: 'heapTotal', bytesCount: heapTotal },
          { key: 'heapUsed', bytesCount: heapUsed },
        ],
        unit,
      );

      if (typeof session.registerReads == 'function') {
        session.registerReads(reads);
      }

      if (verbose) {
        print({ index: session.logsCount, unit, precision, ...reads });
      }
    },
  };
};

const memoryDiagnostics = {
  session: function() {
    this.timeStart = new Date();
    this.durationInMs = 0;
    this.reads = {
      rss: [],
      heapTotal: [],
      heapUsed: [],
    };
    this.avgs = {
      rss: 0,
      heapTotal: 0,
      heapUsed: 0,
    };
    this.registerReads = function(reads) {
      const { rss, heapTotal, heapUsed } = reads;

      this.reads.rss.push(rss || 0);
      this.reads.heapTotal.push(heapTotal || 0);
      this.reads.heapUsed.push(heapUsed || 0);

      this.updateAvgs();
    };
    this.updateAvgs = function() {
      this.avgs.rss =
        this.reads.rss.reduce((acc, r) => (acc += r)) / this.reads.rss.length;
      this.avgs.heapTotal =
        this.reads.heapTotal.reduce((acc, r) => (acc += r)) /
        this.reads.heapTotal.length;
      this.avgs.heapUsed =
        this.reads.heapUsed.reduce((acc, r) => (acc += r)) /
        this.reads.heapUsed.length;
    };
    this.duration = function(unit = 'ms') {
      const end = new Date();
      const d = end - this.timeStart;
      switch (unit) {
        case 'ms':
          return d + unit;
        case 's':
          return d / 1000 + unit;
        default:
          break;
      }
    };
    this.printAvgs = function(precision = defPrecision) {
      console.log(`\nTest suite execution time: ${this.duration('ms')}`);
      console.log(
        `Average memory usage (reads count = ${
          this.logsCount
        }):\n rss: ${this.avgs.rss.toFixed(
          precision,
        )}\n heapTotal: ${this.avgs.heapTotal.toFixed(
          precision,
        )}\n heapUsed: ${this.avgs.heapUsed.toFixed(precision)}\n`,
      );
    };
    this.logsCount = 0;
    return {
      log: generateLog.bind(this),
      summarize: this.printAvgs.bind(this),
    };
  },
};

module.exports = {
  units,
  memoryDiagnostics,
};
