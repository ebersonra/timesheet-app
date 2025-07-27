const { Router } = require('express');
const healthController = require('../controllers/healthController');

const router = Router();

router.get('/health', healthController);

module.exports = router;
