const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const routes = require('./routes');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 4000;
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.app.use(helmet());
    this.app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, '../public')));
  }

  routes() {
    this.app.use('/api', routes);
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Not found' });
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Server running on port ${this.port}`);
    });
  }
}

if (require.main === module) {
  const server = new Server();
  server.start();
}

module.exports = Server;
