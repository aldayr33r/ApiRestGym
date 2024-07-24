const { Router } = require('express');
const router = Router();
const authController = require('../controllers/Auth_controller'); 
const verifyToken = require('../controllers/verifyToken_controller')

router.post('/login', authController.login);

router.get('/prueba', verifyToken, authController.prueba);

module.exports = router;