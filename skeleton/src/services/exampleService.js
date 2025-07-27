const ExampleModel = require('../models/exampleModel');

function getInfo() {
  return {
    status: 'ok',
    version: '1.0.0',
    exampleCount: ExampleModel.count()
  };
}

module.exports = { getInfo };
