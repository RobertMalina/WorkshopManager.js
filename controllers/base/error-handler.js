const errorHandler = (err, req, res) => {
  if (err.response) {
    return res.status(403).send({ title: 'Server responded with an error', message: err.message });
  } else if (err.request) {
    return res.status(503).send({ title: 'Unable to communicate with server', message: err.message });
  } else {
    return res.status(500).send({ title: 'An unexpected error occurred', message: err.message });
  }
};
module.exports = errorHandler;