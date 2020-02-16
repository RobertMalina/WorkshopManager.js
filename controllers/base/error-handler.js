const errorHandler = (err, res) => {
  console.error(err);
  
  if (err.response) {
    return res.status(403).send({ title: 'Server responded with an error', message: err.message });
  } else if (err.request) {
    return res.status(503).send({ title: 'Unable to communicate with server', message: err.message });
  } else if (typeof err === 'string') {
    return res.status(500).send({ title: 'Server responded with error', message: err });
  } else {
    return res.status(500).send({ title: 'An unexpected error occurred', message: err.message });
  }
};
module.exports = errorHandler;