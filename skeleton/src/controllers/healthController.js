const exampleService = require('../services/exampleService');

module.exports = (req, res) => {
  const info = exampleService.getInfo();
  res.json(info);
};
